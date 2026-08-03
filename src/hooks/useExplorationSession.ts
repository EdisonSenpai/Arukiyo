import * as Location from "expo-location";
import { useSQLiteContext } from "expo-sqlite";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  H3_RESOLUTION,
} from "@/constants/exploration";
import {
  clearExploredCells,
  loadExploredCellIds,
  recordExploredCell,
} from "@/lib/exploration-db";
import {
  createCellFeatureCollection,
  homeZoneCells,
  locationToCell,
  visibleGridCells,
} from "@/lib/exploration-grid";
import {
  deleteHomeLocation,
  HomeLocation,
  loadHomeLocation,
  saveHomeLocation,
} from "@/lib/home-location";

export type ExplorationSessionState = {
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
  removeHome: () => Promise<void>;
  saveCurrentAsHome: () => Promise<void>;
  startSession: () => Promise<void>;
  stopSession: () => void;
};

export function useExplorationSession(): ExplorationSessionState {
  const database = useSQLiteContext();
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

  const subscriptionRef =
    useRef<Location.LocationSubscription | null>(null);

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
          setError(
            "Datele locale de explorare nu au putut fi încărcate.",
          );
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
  }, [database]);

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

  const processLocation = useCallback(
    async (location: Location.LocationObject) => {
      setCurrentLocation(location);

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

        setExploredCellIds((previous) => {
          if (previous.has(cellId)) {
            return previous;
          }

          const next = new Set(previous);
          next.add(cellId);
          return next;
        });

        if (isNew) {
          setLastDiscoveredCell(cellId);
        }
      } catch {
        setError(
          "Celula curentă nu a putut fi salvată în jurnalul local.",
        );
      }
    },
    [database],
  );

  const ensurePermission = useCallback(async () => {
    const servicesEnabled =
      await Location.hasServicesEnabledAsync();

    if (!servicesEnabled) {
      throw new Error(
        "GPS-ul este oprit. Activează serviciile de localizare.",
      );
    }

    let activePermission = permission;

    if (!activePermission?.granted) {
      activePermission = await requestPermission();
    }

    if (!activePermission.granted) {
      throw new Error(
        activePermission.canAskAgain
          ? "Arukiyo are nevoie de permisiunea de locație."
          : "Permisiunea este blocată. Activeaz-o din setările aplicației.",
      );
    }

    return activePermission;
  }, [permission, requestPermission]);

  const refreshLocation = useCallback(async () => {
    setIsBusy(true);
    setError(null);

    try {
      await ensurePermission();

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        mayShowUserSettingsDialog: true,
      });

      await processLocation(location);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Poziția nu a putut fi citită.",
      );
    } finally {
      setIsBusy(false);
    }
  }, [ensurePermission, processLocation]);

  const stopSession = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    setIsSessionActive(false);
  }, []);

  const startSession = useCallback(async () => {
    if (isSessionActive) {
      stopSession();
      return;
    }

    setIsBusy(true);
    setError(null);

    try {
      await ensurePermission();

      const initialLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          mayShowUserSettingsDialog: true,
        });

      await processLocation(initialLocation);

      subscriptionRef.current =
        await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 12,
            timeInterval: 5_000,
          },
          (location) => {
            void processLocation(location);
          },
        );

      setIsSessionActive(true);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Sesiunea de explorare nu a putut porni.",
      );
    } finally {
      setIsBusy(false);
    }
  }, [
    ensurePermission,
    isSessionActive,
    processLocation,
    stopSession,
  ]);

  useEffect(
    () => () => {
      subscriptionRef.current?.remove();
    },
    [],
  );

  const saveCurrentAsHome = useCallback(async () => {
    if (!currentLocation) {
      setError(
        "Citește poziția înainte să setezi zona Home.",
      );
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
      setError("Zona Home nu a putut fi salvată securizat.");
    } finally {
      setIsBusy(false);
    }
  }, [currentLocation]);

  const removeHome = useCallback(async () => {
    setIsBusy(true);
    setError(null);

    try {
      await deleteHomeLocation();
      setHomeLocation(null);
    } catch {
      setError("Zona Home nu a putut fi ștearsă.");
    } finally {
      setIsBusy(false);
    }
  }, []);

  const clearExploration = useCallback(async () => {
    setIsBusy(true);
    setError(null);

    try {
      await clearExploredCells(database);
      setExploredCellIds(new Set());
      setLastDiscoveredCell(null);
    } catch {
      setError(
        "Istoricul local de explorare nu a putut fi resetat.",
      );
    } finally {
      setIsBusy(false);
    }
  }, [database]);

  return {
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
    removeHome,
    saveCurrentAsHome,
    startSession,
    stopSession,
  };
}
