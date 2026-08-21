import type * as Location from "expo-location";
import { useSQLiteContext } from "expo-sqlite";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  LANDMARK_SCAN_RADIUS_METERS,
  LANDMARK_SCAN_REUSE_DISTANCE_METERS,
  LANDMARK_SCAN_TTL_MS,
} from "@/constants/landmarks";
import {
  ensureLandmarkDatabase,
  getLandmarkScanState,
  listNearbyLandmarks,
  saveLandmarkScanState,
  upsertLandmarks,
  type LandmarkScanState,
} from "@/lib/landmark-db";
import { fetchNearbyLandmarkCandidates } from "@/lib/landmark-overpass";
import {
  haversineDistanceMeters,
  type NearbyLandmark,
} from "@/lib/landmarks";

export type LandmarkScanStatus =
  | "idle"
  | "loading"
  | "ready"
  | "error";

export type NearbyLandmarksState = {
  cachedCandidateCount: number;
  eligibleLandmarks: NearbyLandmark[];
  error: string | null;
  lastScanAt: string | null;
  landmarks: NearbyLandmark[];
  rawCandidateCount: number;
  scan: (force?: boolean) => Promise<void>;
  source: "cache" | "network" | null;
  status: LandmarkScanStatus;
};

export function useNearbyLandmarks(
  currentLocation: Location.LocationObject | null,
): NearbyLandmarksState {
  const database = useSQLiteContext();
  const [landmarks, setLandmarks] = useState<
    NearbyLandmark[]
  >([]);
  const [status, setStatus] =
    useState<LandmarkScanStatus>("idle");
  const [error, setError] = useState<string | null>(
    null,
  );
  const [lastScanAt, setLastScanAt] = useState<
    string | null
  >(null);
  const [source, setSource] = useState<
    "cache" | "network" | null
  >(null);
  const [rawCandidateCount, setRawCandidateCount] =
    useState(0);
  const [cachedCandidateCount, setCachedCandidateCount] =
    useState(0);

  const lastAutoCenterRef = useRef<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const runningRef = useRef(false);

  const scan = useCallback(
    async (force = false) => {
      if (!currentLocation || runningRef.current) {
        return;
      }

      runningRef.current = true;
      setStatus("loading");
      setError(null);

      const latitude =
        currentLocation.coords.latitude;
      const longitude =
        currentLocation.coords.longitude;

      try {
        await ensureLandmarkDatabase(database);

        const existingScan =
          await getLandmarkScanState(database);
        const shouldReuse =
          !force &&
          isReusableScan(
            existingScan,
            latitude,
            longitude,
          );

        if (shouldReuse && existingScan) {
          const cached = await listNearbyLandmarks(
            database,
            latitude,
            longitude,
          );

          setLandmarks(cached);
          setRawCandidateCount(
            existingScan.rawCandidateCount,
          );
          setCachedCandidateCount(
            existingScan.storedCandidateCount,
          );
          setLastScanAt(existingScan.fetchedAt);
          setSource("cache");
          setStatus("ready");
          return;
        }

        const fetched =
          await fetchNearbyLandmarkCandidates(
            latitude,
            longitude,
          );

        await upsertLandmarks(
          database,
          fetched.accepted,
        );

        const scanState: LandmarkScanState = {
          centerLatitude: latitude,
          centerLongitude: longitude,
          endpoint: fetched.endpoint,
          fetchedAt: fetched.fetchedAt,
          radiusMeters:
            LANDMARK_SCAN_RADIUS_METERS,
          rawCandidateCount:
            fetched.rawCandidateCount,
          storedCandidateCount:
            fetched.accepted.length,
        };

        await saveLandmarkScanState(
          database,
          scanState,
        );

        const nearby = await listNearbyLandmarks(
          database,
          latitude,
          longitude,
        );

        setLandmarks(nearby);
        setRawCandidateCount(
          fetched.rawCandidateCount,
        );
        setCachedCandidateCount(
          fetched.accepted.length,
        );
        setLastScanAt(fetched.fetchedAt);
        setSource("network");
        setStatus("ready");
      } catch (reason) {
        try {
          const cached = await listNearbyLandmarks(
            database,
            latitude,
            longitude,
          );

          if (cached.length > 0) {
            const existingScan =
              await getLandmarkScanState(database);

            setLandmarks(cached);
            setRawCandidateCount(
              existingScan?.rawCandidateCount ?? 0,
            );
            setCachedCandidateCount(
              existingScan?.storedCandidateCount ??
                cached.length,
            );
            setLastScanAt(
              existingScan?.fetchedAt ?? null,
            );
            setSource("cache");
            setStatus("ready");
            setError(
              reason instanceof Error
                ? reason.message
                : "Landmark network scan failed.",
            );
            return;
          }
        } catch {
          // Fall through to the visible error state.
        }

        setStatus("error");
        setSource(null);
        setError(
          reason instanceof Error
            ? reason.message
            : "Landmark scan failed.",
        );
      } finally {
        runningRef.current = false;
      }
    },
    [currentLocation, database],
  );

  useEffect(() => {
    if (!currentLocation) {
      return;
    }

    const nextCenter = {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    };
    const previousCenter = lastAutoCenterRef.current;

    if (
      previousCenter &&
      haversineDistanceMeters(
        previousCenter.latitude,
        previousCenter.longitude,
        nextCenter.latitude,
        nextCenter.longitude,
      ) < 250
    ) {
      return;
    }

    lastAutoCenterRef.current = nextCenter;
    void scan(false);
  }, [currentLocation, scan]);

  return {
    cachedCandidateCount,
    eligibleLandmarks: landmarks.filter(
      (landmark) => landmark.eligible,
    ),
    error,
    lastScanAt,
    landmarks,
    rawCandidateCount,
    scan,
    source,
    status,
  };
}

function isReusableScan(
  state: LandmarkScanState | null,
  latitude: number,
  longitude: number,
): boolean {
  if (!state) {
    return false;
  }

  const fetchedAt = Date.parse(state.fetchedAt);

  if (
    !Number.isFinite(fetchedAt) ||
    Date.now() - fetchedAt > LANDMARK_SCAN_TTL_MS
  ) {
    return false;
  }

  return (
    haversineDistanceMeters(
      state.centerLatitude,
      state.centerLongitude,
      latitude,
      longitude,
    ) <= LANDMARK_SCAN_REUSE_DISTANCE_METERS
  );
}
