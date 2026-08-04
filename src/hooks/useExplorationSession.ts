import * as Location from "expo-location";
import { useSQLiteContext } from "expo-sqlite";
import {
  AppState,
  type AppStateStatus,
} from "react-native";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import { H3_RESOLUTION } from "@/constants/exploration";
import {
  clearExploredCells,
  completeExplorationSession,
  createExplorationSession,
  type ExplorationSessionStatus,
  type ExplorationSessionSummary,
  insertExplorationPoint,
  loadExploredCellIds,
  recordExploredCell,
  updateExplorationSessionProgress,
} from "@/lib/exploration-db";
import {
  createCellFeatureCollection,
  homeZoneCells,
  locationToCell,
  visibleGridCells,
} from "@/lib/exploration-grid";
import {
  deleteHomeLocation,
  type HomeLocation,
  loadHomeLocation,
  saveHomeLocation,
} from "@/lib/home-location";
import { awardSessionRewards } from "@/lib/progression-db";
import {
  evaluateSessionPoint,
  isAccurateEnoughForDiscovery,
  locationToSessionPoint,
  type SessionPoint,
} from "@/lib/session-tracking";

export type ExplorationSessionState = {
  acceptedPointCount: number;
  activeSessionStartedAt: string | null;
  cellFeatures: ReturnType<typeof createCellFeatureCollection>;
  clearExploration: () => Promise<void>;
  currentCell: string | null;
  currentLocation: Location.LocationObject | null;
  error: string | null;
  exploredCellCount: number;
  homeLocation: HomeLocation | null;
  homeZoneCompletion: number;
  homeZoneExploredCount: number;
  homeZoneTotalCount: number;
  isBusy: boolean;
  isHydrating: boolean;
  isSessionActive: boolean;
  lastDiscoveredCell: string | null;
  permission: Location.LocationPermissionResponse | null;
  refreshLocation: () => Promise<void>;
  rejectedPointCount: number;
  removeHome: () => Promise<void>;
  routePoints: SessionPoint[];
  saveCurrentAsHome: () => Promise<void>;
  sessionDistanceMeters: number;
  sessionElapsedSeconds: number;
  sessionNewCellCount: number;
  startSession: () => Promise<void>;
  stopSession: () => Promise<ExplorationSessionSummary | null>;
};

export function useExplorationSession(): ExplorationSessionState {
  const database = useSQLiteContext();
  const { t } = useTranslation();
  const [permission, requestPermission] =
    Location.useForegroundPermissions();

  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObject | null>(null);
  const [homeLocation, setHomeLocation] =
    useState<HomeLocation | null>(null);
  const [exploredCellIds, setExploredCellIds] =
    useState<Set<string>>(new Set());
  const [lastDiscoveredCell, setLastDiscoveredCell] =
    useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeSessionStartedAt, setActiveSessionStartedAt] =
    useState<string | null>(null);
  const [routePoints, setRoutePoints] =
    useState<SessionPoint[]>([]);
  const [sessionDistanceMeters, setSessionDistanceMeters] =
    useState(0);
  const [sessionElapsedSeconds, setSessionElapsedSeconds] =
    useState(0);
  const [sessionNewCellCount, setSessionNewCellCount] =
    useState(0);
  const [acceptedPointCount, setAcceptedPointCount] =
    useState(0);
  const [rejectedPointCount, setRejectedPointCount] =
    useState(0);

  const subscriptionRef =
    useRef<Location.LocationSubscription | null>(null);
  const activeSessionIdRef = useRef<string | null>(null);
  const activeSessionStartedAtRef = useRef<string | null>(null);
  const lastAcceptedPointRef = useRef<SessionPoint | null>(null);
  const routePointsRef = useRef<SessionPoint[]>([]);
  const sessionDistanceRef = useRef(0);
  const sessionNewCellsRef = useRef(new Set<string>());
  const acceptedPointCountRef = useRef(0);
  const rejectedPointCountRef = useRef(0);
  const processingQueueRef = useRef<Promise<void>>(
    Promise.resolve(),
  );
  const isFinalizingRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      try {
        const [storedHome, storedCells] = await Promise.all([
          loadHomeLocation(),
          loadExploredCellIds(database),
        ]);

        if (mounted) {
          setHomeLocation(storedHome);
          setExploredCellIds(storedCells);
        }
      } catch {
        if (mounted) {
          setError(t("explore.errors.loadData"));
        }
      } finally {
        if (mounted) {
          setIsHydrating(false);
        }
      }
    }

    void hydrate();

    return () => {
      mounted = false;
    };
  }, [database, t]);

  const currentCell = useMemo(() => {
    if (!currentLocation) {
      return null;
    }

    return locationToCell(
      currentLocation.coords.latitude,
      currentLocation.coords.longitude,
    );
  }, [currentLocation]);

  const homeCell = useMemo(() => {
    if (!homeLocation) {
      return null;
    }

    return locationToCell(
      homeLocation.latitude,
      homeLocation.longitude,
    );
  }, [homeLocation]);

  const localHomeCells = useMemo(
    () => homeZoneCells(homeCell ?? currentCell),
    [currentCell, homeCell],
  );

  const visibleCells = useMemo(
    () => visibleGridCells(homeCell, currentCell),
    [currentCell, homeCell],
  );

  const cellFeatures = useMemo(
    () =>
      createCellFeatureCollection(
        visibleCells,
        exploredCellIds,
        currentCell,
      ),
    [currentCell, exploredCellIds, visibleCells],
  );

  const homeZoneExploredCount = useMemo(
    () =>
      localHomeCells.reduce(
        (total, cellId) =>
          total + (exploredCellIds.has(cellId) ? 1 : 0),
        0,
      ),
    [exploredCellIds, localHomeCells],
  );

  const homeZoneTotalCount = localHomeCells.length;

  const homeZoneCompletion =
    homeZoneTotalCount === 0
      ? 0
      : (homeZoneExploredCount / homeZoneTotalCount) * 100;

  const buildLiveSummary = useCallback(
    (
      status: ExplorationSessionStatus,
      endedAt: string | null,
    ): ExplorationSessionSummary | null => {
      const id = activeSessionIdRef.current;
      const startedAt = activeSessionStartedAtRef.current;

      if (!id || !startedAt) {
        return null;
      }

      const durationSeconds = Math.max(
        0,
        Math.floor(
          ((endedAt ? Date.parse(endedAt) : Date.now()) -
            Date.parse(startedAt)) /
            1_000,
        ),
      );

      return {
        acceptedPoints: acceptedPointCountRef.current,
        discoveredCells: sessionNewCellsRef.current.size,
        distanceMeters: sessionDistanceRef.current,
        durationSeconds,
        endedAt,
        id,
        rejectedPoints: rejectedPointCountRef.current,
        startedAt,
        status,
      };
    },
    [],
  );

  const persistLiveProgress = useCallback(async () => {
    const summary = buildLiveSummary("active", null);

    if (!summary) {
      return;
    }

    await updateExplorationSessionProgress(
      database,
      summary,
    );
  }, [buildLiveSummary, database]);

  const processLocation = useCallback(
    async (location: Location.LocationObject) => {
      setCurrentLocation(location);

      const activeSessionId = activeSessionIdRef.current;

      if (!activeSessionId) {
        if (!isAccurateEnoughForDiscovery(location)) {
          return;
        }

        const cellId = locationToCell(
          location.coords.latitude,
          location.coords.longitude,
        );

        try {
          const isNew = await recordExploredCell(
            database,
            cellId,
            H3_RESOLUTION,
          );

          if (isNew) {
            setExploredCellIds((previous) => {
              const next = new Set(previous);
              next.add(cellId);
              return next;
            });
            setLastDiscoveredCell(cellId);
          }
        } catch {
          setError(t("explore.errors.saveCell"));
        }

        return;
      }

      const candidate = locationToSessionPoint(
        location,
        acceptedPointCountRef.current,
      );
      const decision = evaluateSessionPoint(
        lastAcceptedPointRef.current,
        candidate,
      );

      if (!decision.accepted) {
        rejectedPointCountRef.current += 1;
        setRejectedPointCount(
          rejectedPointCountRef.current,
        );

        try {
          await persistLiveProgress();
        } catch {
          setError(t("session.errors.savePoint"));
        }

        return;
      }

      const acceptedPoint: SessionPoint = {
        ...candidate,
        sequence: acceptedPointCountRef.current,
      };

      try {
        await insertExplorationPoint(
          database,
          activeSessionId,
          acceptedPoint,
        );

        lastAcceptedPointRef.current = acceptedPoint;
        routePointsRef.current = [
          ...routePointsRef.current,
          acceptedPoint,
        ];
        acceptedPointCountRef.current += 1;
        sessionDistanceRef.current +=
          decision.segmentDistanceMeters;

        setRoutePoints(routePointsRef.current);
        setAcceptedPointCount(
          acceptedPointCountRef.current,
        );
        setSessionDistanceMeters(
          sessionDistanceRef.current,
        );

        const cellId = locationToCell(
          acceptedPoint.latitude,
          acceptedPoint.longitude,
        );
        const isNew = await recordExploredCell(
          database,
          cellId,
          H3_RESOLUTION,
        );

        setExploredCellIds((previous) => {
          if (previous.has(cellId)) {
            return previous;
          }

          const next = new Set(previous);
          next.add(cellId);
          return next;
        });

        if (isNew) {
          sessionNewCellsRef.current.add(cellId);
          setSessionNewCellCount(
            sessionNewCellsRef.current.size,
          );
          setLastDiscoveredCell(cellId);
        }

        await persistLiveProgress();
      } catch {
        setError(t("session.errors.savePoint"));
      }
    },
    [database, persistLiveProgress, t],
  );

  const enqueueLocation = useCallback(
    async (location: Location.LocationObject) => {
      const nextTask = processingQueueRef.current.then(
        () => processLocation(location),
      );

      processingQueueRef.current = nextTask.catch(
        () => undefined,
      );

      await nextTask;
    },
    [processLocation],
  );

  const ensurePermission = useCallback(async () => {
    const servicesEnabled =
      await Location.hasServicesEnabledAsync();

    if (!servicesEnabled) {
      throw new Error(t("explore.errors.gpsOff"));
    }

    let activePermission = permission;

    if (!activePermission?.granted) {
      activePermission = await requestPermission();
    }

    if (!activePermission.granted) {
      throw new Error(
        activePermission.canAskAgain
          ? t("explore.errors.permissionNeeded")
          : t("explore.errors.permissionBlocked"),
      );
    }

    return activePermission;
  }, [permission, requestPermission, t]);

  const refreshLocation = useCallback(async () => {
    setIsBusy(true);
    setError(null);

    try {
      await ensurePermission();

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        mayShowUserSettingsDialog: true,
      });

      await enqueueLocation(location);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : t("explore.errors.readLocation"),
      );
    } finally {
      setIsBusy(false);
    }
  }, [enqueueLocation, ensurePermission, t]);

  const finalizeSession = useCallback(
    async (
      status: Exclude<
        ExplorationSessionStatus,
        "active"
      >,
    ): Promise<ExplorationSessionSummary | null> => {
      if (
        !activeSessionIdRef.current ||
        isFinalizingRef.current
      ) {
        return null;
      }

      isFinalizingRef.current = true;
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
      setIsSessionActive(false);
      setIsBusy(true);

      try {
        await processingQueueRef.current;

        const endedAt = new Date().toISOString();
        const summary = buildLiveSummary(
          status,
          endedAt,
        );

        if (!summary) {
          return null;
        }

        await completeExplorationSession(
          database,
          summary,
        );

        try {
          await awardSessionRewards(database, summary);
        } catch {
          setError(t("progression.errors.award"));
        }

        setSessionElapsedSeconds(
          summary.durationSeconds,
        );

        activeSessionIdRef.current = null;
        activeSessionStartedAtRef.current = null;
        setActiveSessionStartedAt(null);

        return summary;
      } catch {
        setError(t("session.errors.finish"));
        return null;
      } finally {
        isFinalizingRef.current = false;
        setIsBusy(false);
      }
    },
    [buildLiveSummary, database, t],
  );

  const stopSession = useCallback(
    () => finalizeSession("completed"),
    [finalizeSession],
  );

  const startSession = useCallback(async () => {
    if (activeSessionIdRef.current) {
      return;
    }

    setIsBusy(true);
    setError(null);

    try {
      await ensurePermission();

      const startedAt = new Date().toISOString();
      const sessionId = createSessionId();

      await createExplorationSession(
        database,
        sessionId,
        startedAt,
      );

      activeSessionIdRef.current = sessionId;
      activeSessionStartedAtRef.current = startedAt;
      lastAcceptedPointRef.current = null;
      routePointsRef.current = [];
      sessionDistanceRef.current = 0;
      sessionNewCellsRef.current = new Set();
      acceptedPointCountRef.current = 0;
      rejectedPointCountRef.current = 0;
      processingQueueRef.current = Promise.resolve();

      setActiveSessionStartedAt(startedAt);
      setRoutePoints([]);
      setSessionDistanceMeters(0);
      setSessionElapsedSeconds(0);
      setSessionNewCellCount(0);
      setAcceptedPointCount(0);
      setRejectedPointCount(0);
      setIsSessionActive(true);

      const initialLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          mayShowUserSettingsDialog: true,
        });

      await enqueueLocation(initialLocation);

      subscriptionRef.current =
        await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 8,
            timeInterval: 4_000,
          },
          (location) => {
            void enqueueLocation(location);
          },
        );
    } catch (reason) {
      if (activeSessionIdRef.current) {
        await finalizeSession("interrupted");
      }

      setError(
        reason instanceof Error
          ? reason.message
          : t("session.errors.create"),
      );
    } finally {
      setIsBusy(false);
    }
  }, [
    database,
    enqueueLocation,
    ensurePermission,
    finalizeSession,
    t,
  ]);

  useEffect(() => {
    if (!isSessionActive || !activeSessionStartedAt) {
      return;
    }

    const updateElapsed = () => {
      setSessionElapsedSeconds(
        Math.max(
          0,
          Math.floor(
            (Date.now() -
              Date.parse(activeSessionStartedAt)) /
              1_000,
          ),
        ),
      );
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1_000);

    return () => clearInterval(interval);
  }, [activeSessionStartedAt, isSessionActive]);

  useEffect(() => {
    const handleAppState = (state: AppStateStatus) => {
      if (
        state !== "active" &&
        activeSessionIdRef.current
      ) {
        void finalizeSession("interrupted");
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppState,
    );

    return () => subscription.remove();
  }, [finalizeSession]);

  useEffect(
    () => () => {
      subscriptionRef.current?.remove();
    },
    [],
  );

  const saveCurrentAsHome = useCallback(async () => {
    if (!currentLocation) {
      setError(t("explore.errors.setHomeFirst"));
      return;
    }

    setIsBusy(true);
    setError(null);

    try {
      const value: HomeLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        accuracy: currentLocation.coords.accuracy,
        createdAt: new Date().toISOString(),
      };

      await saveHomeLocation(value);
      setHomeLocation(value);
    } catch {
      setError(t("explore.errors.saveHome"));
    } finally {
      setIsBusy(false);
    }
  }, [currentLocation, t]);

  const removeHome = useCallback(async () => {
    setIsBusy(true);
    setError(null);

    try {
      await deleteHomeLocation();
      setHomeLocation(null);
    } catch {
      setError(t("explore.errors.deleteHome"));
    } finally {
      setIsBusy(false);
    }
  }, [t]);

  const clearExploration = useCallback(async () => {
    setIsBusy(true);
    setError(null);

    try {
      await clearExploredCells(database);
      setExploredCellIds(new Set());
      setLastDiscoveredCell(null);
    } catch {
      setError(t("explore.errors.resetFog"));
    } finally {
      setIsBusy(false);
    }
  }, [database, t]);

  return {
    acceptedPointCount,
    activeSessionStartedAt,
    cellFeatures,
    clearExploration,
    currentCell,
    currentLocation,
    error,
    exploredCellCount: exploredCellIds.size,
    homeLocation,
    homeZoneCompletion,
    homeZoneExploredCount,
    homeZoneTotalCount,
    isBusy,
    isHydrating,
    isSessionActive,
    lastDiscoveredCell,
    permission,
    refreshLocation,
    rejectedPointCount,
    removeHome,
    routePoints,
    saveCurrentAsHome,
    sessionDistanceMeters,
    sessionElapsedSeconds,
    sessionNewCellCount,
    startSession,
    stopSession,
  };
}

function createSessionId(): string {
  return [
    "session",
    Date.now().toString(36),
    Math.random().toString(36).slice(2, 10),
  ].join("-");
}
