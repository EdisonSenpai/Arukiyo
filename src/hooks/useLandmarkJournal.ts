import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import {
  useCallback,
  useState,
} from "react";

import {
  listUnlockedLandmarks,
  type UnlockedLandmarkSummary,
} from "@/lib/landmark-db";

export function useLandmarkJournal() {
  const database = useSQLiteContext();
  const [landmarks, setLandmarks] = useState<
    UnlockedLandmarkSummary[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    null,
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setLandmarks(
        await listUnlockedLandmarks(database),
      );
    } catch {
      setError(
        "Local landmark collection could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [database]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return {
    error,
    isLoading,
    landmarks,
    refresh,
  };
}
