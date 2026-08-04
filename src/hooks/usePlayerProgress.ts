import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import {
  useCallback,
  useState,
} from "react";

import {
  EMPTY_PROGRESS_DASHBOARD,
  getPlayerProgressDashboard,
  reconcileUnrewardedSessions,
  type PlayerProgressDashboard,
} from "@/lib/progression-db";

export type PlayerProgressState = {
  error: string | null;
  isLoading: boolean;
  progress: PlayerProgressDashboard;
  refresh: () => Promise<void>;
};

export function usePlayerProgress(): PlayerProgressState {
  const database = useSQLiteContext();
  const [progress, setProgress] =
    useState<PlayerProgressDashboard>(
      EMPTY_PROGRESS_DASHBOARD,
    );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await reconcileUnrewardedSessions(database);
      const next =
        await getPlayerProgressDashboard(database);
      setProgress(next);
    } catch {
      setError(
        "Local progression data could not be loaded.",
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
    progress,
    refresh,
  };
}
