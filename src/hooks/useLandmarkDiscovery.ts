import type * as Location from "expo-location";
import { useSQLiteContext } from "expo-sqlite";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  LANDMARK_UNLOCK_MAX_ACCURACY_METERS,
  LANDMARK_UNLOCK_RADIUS_METERS,
} from "@/constants/landmarks";
import {
  loadUnlockedLandmarkIds,
  unlockLandmark,
  type LandmarkUnlockResult,
} from "@/lib/landmark-db";
import type { NearbyLandmark } from "@/lib/landmarks";

export type LandmarkDiscoveryState = {
  dismissLastUnlock: () => void;
  lastUnlock: LandmarkUnlockResult | null;
  unlockedLandmarkIds: Set<string>;
};

export function useLandmarkDiscovery({
  activeSessionId,
  currentLocation,
  isSessionActive,
  landmarks,
}: {
  activeSessionId: string | null;
  currentLocation: Location.LocationObject | null;
  isSessionActive: boolean;
  landmarks: NearbyLandmark[];
}): LandmarkDiscoveryState {
  const database = useSQLiteContext();
  const [unlockedLandmarkIds, setUnlockedLandmarkIds] =
    useState<Set<string>>(new Set());
  const [lastUnlock, setLastUnlock] =
    useState<LandmarkUnlockResult | null>(null);
  const unlockingRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    void loadUnlockedLandmarkIds(database)
      .then((ids) => {
        if (mounted) {
          setUnlockedLandmarkIds(ids);
        }
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, [database]);

  useEffect(() => {
    if (
      !isSessionActive ||
      !activeSessionId ||
      !currentLocation ||
      unlockingRef.current
    ) {
      return;
    }

    const accuracy =
      currentLocation.coords.accuracy ?? null;

    if (
      accuracy === null ||
      accuracy >
        LANDMARK_UNLOCK_MAX_ACCURACY_METERS
    ) {
      return;
    }

    const candidate = landmarks.find(
      (landmark) =>
        landmark.eligible &&
        landmark.distanceMeters <=
          LANDMARK_UNLOCK_RADIUS_METERS &&
        !unlockedLandmarkIds.has(landmark.id),
    );

    if (!candidate) {
      return;
    }

    unlockingRef.current = true;

    void unlockLandmark(database, candidate, {
      distanceMeters: candidate.distanceMeters,
      gpsAccuracyMeters: accuracy,
      sessionId: activeSessionId,
    })
      .then((result) => {
        setUnlockedLandmarkIds((previous) => {
          const next = new Set(previous);
          next.add(candidate.id);
          return next;
        });

        if (result) {
          setLastUnlock(result);
        }
      })
      .finally(() => {
        unlockingRef.current = false;
      });
  }, [
    activeSessionId,
    currentLocation,
    database,
    isSessionActive,
    landmarks,
    unlockedLandmarkIds,
  ]);

  const dismissLastUnlock = useCallback(() => {
    setLastUnlock(null);
  }, []);

  return {
    dismissLastUnlock,
    lastUnlock,
    unlockedLandmarkIds,
  };
}
