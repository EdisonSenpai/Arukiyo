import type { SQLiteDatabase } from "expo-sqlite";

import {
  type ExplorationSessionSummary,
  getExplorationSessionDetails,
} from "@/lib/exploration-db";
import {
  calculateSessionReward,
  getLevelProgress,
  toLocalDayKey,
  type ExplorerRankKey,
  type LevelProgress,
  type SessionRewardCalculation,
} from "@/lib/progression";

type PlayerProgressRow = {
  coins: number;
  rewarded_sessions: number;
  total_distance_meters: number;
  total_xp: number;
};

type CountRow = {
  count: number;
};

type DailyProgressRow = {
  first_session_bonus_claimed: number;
  one_kilometer_bonus_claimed: number;
  today_distance_meters: number;
  today_longest_session_meters: number;
  today_new_cells: number;
  today_sessions: number;
};

type RewardRow = {
  awarded_at: string;
  completion_coins: number;
  completion_xp: number;
  day_key: string;
  discovery_coins: number;
  discovery_xp: number;
  distance_coins: number;
  distance_xp: number;
  first_session_bonus: number;
  first_session_coins: number;
  first_session_xp: number;
  id: number;
  new_level: number;
  new_total_xp: number;
  one_kilometer_bonus: number;
  one_kilometer_coins: number;
  one_kilometer_xp: number;
  previous_level: number;
  previous_total_xp: number;
  session_id: string;
  total_coins: number;
  total_xp: number;
};

type UnrewardedSessionRow = {
  id: string;
};

export type PlayerProgressDashboard = LevelProgress & {
  coins: number;
  discoveredCells: number;
  firstSessionBonusClaimed: boolean;
  oneKilometerBonusClaimed: boolean;
  rewardedSessions: number;
  todayDistanceMeters: number;
  todayLongestSessionMeters: number;
  todayNewCells: number;
  todaySessions: number;
  totalDistanceMeters: number;
};

export type SessionRewardRecord =
  SessionRewardCalculation & {
    awardedAt: string;
    id: number;
    newLevel: number;
    newRankKey: ExplorerRankKey;
    newTotalXp: number;
    previousLevel: number;
    previousRankKey: ExplorerRankKey;
    previousTotalXp: number;
    sessionId: string;
  };

export const EMPTY_PROGRESS_DASHBOARD: PlayerProgressDashboard = {
  coins: 0,
  currentLevelXp: 0,
  discoveredCells: 0,
  firstSessionBonusClaimed: false,
  level: 1,
  oneKilometerBonusClaimed: false,
  progressRatio: 0,
  rankKey: "wanderer",
  rewardedSessions: 0,
  todayDistanceMeters: 0,
  todayLongestSessionMeters: 0,
  todayNewCells: 0,
  todaySessions: 0,
  totalDistanceMeters: 0,
  totalXp: 0,
  xpForNextLevel: 100,
};

export async function awardSessionRewards(
  database: SQLiteDatabase,
  session: ExplorationSessionSummary,
): Promise<SessionRewardRecord> {
  const existing = await getSessionReward(
    database,
    session.id,
  );

  if (existing) {
    return existing;
  }

  const dayKey = toLocalDayKey(
    session.endedAt ?? session.startedAt,
  );

  const [firstBonusRow, kilometerBonusRow, progressRow] =
    await Promise.all([
      database.getFirstAsync<CountRow>(
        `
          SELECT COUNT(*) AS count
          FROM reward_events
          WHERE day_key = ?
            AND first_session_bonus = 1
        `,
        dayKey,
      ),
      database.getFirstAsync<CountRow>(
        `
          SELECT COUNT(*) AS count
          FROM reward_events
          WHERE day_key = ?
            AND one_kilometer_bonus = 1
        `,
        dayKey,
      ),
      getPlayerProgressRow(database),
    ]);

  const reward = calculateSessionReward(session, {
    firstCompletedSessionOfDay:
      (firstBonusRow?.count ?? 0) === 0,
    firstKilometerSessionOfDay:
      (kilometerBonusRow?.count ?? 0) === 0,
  });

  const awardedAt = new Date().toISOString();
  const previousTotalXp = progressRow.total_xp;
  const previousLevelProgress =
    getLevelProgress(previousTotalXp);
  const newTotalXp = previousTotalXp + reward.totalXp;
  const newLevelProgress = getLevelProgress(newTotalXp);

  await database.withTransactionAsync(async () => {
    const insertResult = await database.runAsync(
      `
        INSERT OR IGNORE INTO reward_events (
          session_id,
          day_key,
          awarded_at,
          distance_xp,
          discovery_xp,
          completion_xp,
          first_session_xp,
          one_kilometer_xp,
          total_xp,
          distance_coins,
          discovery_coins,
          completion_coins,
          first_session_coins,
          one_kilometer_coins,
          total_coins,
          first_session_bonus,
          one_kilometer_bonus,
          previous_total_xp,
          new_total_xp,
          previous_level,
          new_level
        )
        VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?
        )
      `,
      session.id,
      reward.dayKey,
      awardedAt,
      reward.distanceXp,
      reward.discoveryXp,
      reward.completionXp,
      reward.firstSessionXp,
      reward.oneKilometerXp,
      reward.totalXp,
      reward.distanceCoins,
      reward.discoveryCoins,
      reward.completionCoins,
      reward.firstSessionCoins,
      reward.oneKilometerCoins,
      reward.totalCoins,
      reward.firstSessionBonus ? 1 : 0,
      reward.oneKilometerBonus ? 1 : 0,
      previousTotalXp,
      newTotalXp,
      previousLevelProgress.level,
      newLevelProgress.level,
    );

    if (insertResult.changes === 0) {
      return;
    }

    await database.runAsync(
      `
        UPDATE player_progress
        SET
          total_xp = total_xp + ?,
          coins = coins + ?,
          total_distance_meters =
            total_distance_meters + ?,
          rewarded_sessions = rewarded_sessions + 1,
          updated_at = ?
        WHERE id = 1
      `,
      reward.totalXp,
      reward.totalCoins,
      session.distanceMeters,
      awardedAt,
    );
  });

  const stored = await getSessionReward(
    database,
    session.id,
  );

  if (!stored) {
    throw new Error(
      "The session reward could not be persisted.",
    );
  }

  return stored;
}

export async function getSessionReward(
  database: SQLiteDatabase,
  sessionId: string,
): Promise<SessionRewardRecord | null> {
  const row = await database.getFirstAsync<RewardRow>(
    `
      SELECT
        id,
        session_id,
        day_key,
        awarded_at,
        distance_xp,
        discovery_xp,
        completion_xp,
        first_session_xp,
        one_kilometer_xp,
        total_xp,
        distance_coins,
        discovery_coins,
        completion_coins,
        first_session_coins,
        one_kilometer_coins,
        total_coins,
        first_session_bonus,
        one_kilometer_bonus,
        previous_total_xp,
        new_total_xp,
        previous_level,
        new_level
      FROM reward_events
      WHERE session_id = ?
      LIMIT 1
    `,
    sessionId,
  );

  if (!row) {
    return null;
  }

  return {
    awardedAt: row.awarded_at,
    completionCoins: row.completion_coins,
    completionXp: row.completion_xp,
    dayKey: row.day_key,
    discoveryCoins: row.discovery_coins,
    discoveryXp: row.discovery_xp,
    distanceCoins: row.distance_coins,
    distanceXp: row.distance_xp,
    firstSessionBonus: row.first_session_bonus === 1,
    firstSessionCoins: row.first_session_coins,
    firstSessionXp: row.first_session_xp,
    id: row.id,
    newLevel: row.new_level,
    newRankKey: getLevelProgress(
      row.new_total_xp,
    ).rankKey,
    newTotalXp: row.new_total_xp,
    oneKilometerBonus:
      row.one_kilometer_bonus === 1,
    oneKilometerCoins: row.one_kilometer_coins,
    oneKilometerXp: row.one_kilometer_xp,
    previousLevel: row.previous_level,
    previousRankKey: getLevelProgress(
      row.previous_total_xp,
    ).rankKey,
    previousTotalXp: row.previous_total_xp,
    sessionId: row.session_id,
    totalCoins: row.total_coins,
    totalXp: row.total_xp,
  };
}

export async function reconcileUnrewardedSessions(
  database: SQLiteDatabase,
): Promise<number> {
  const rows =
    await database.getAllAsync<UnrewardedSessionRow>(
      `
        SELECT exploration_sessions.id
        FROM exploration_sessions
        LEFT JOIN reward_events
          ON reward_events.session_id =
            exploration_sessions.id
        WHERE exploration_sessions.status != 'active'
          AND reward_events.id IS NULL
        ORDER BY exploration_sessions.started_at ASC
      `,
    );

  let rewarded = 0;

  for (const row of rows) {
    const session =
      await getExplorationSessionDetails(
        database,
        row.id,
      );

    if (!session) {
      continue;
    }

    await awardSessionRewards(database, session);
    rewarded += 1;
  }

  return rewarded;
}

export async function getPlayerProgressDashboard(
  database: SQLiteDatabase,
): Promise<PlayerProgressDashboard> {
  const dayKey = toLocalDayKey(
    new Date().toISOString(),
  );

  const [progressRow, discoveredRow, dailyRow] =
    await Promise.all([
      getPlayerProgressRow(database),
      database.getFirstAsync<CountRow>(
        `
          SELECT COUNT(*) AS count
          FROM explored_cells
        `,
      ),
      database.getFirstAsync<DailyProgressRow>(
        `
          SELECT
            COALESCE(
              SUM(exploration_sessions.distance_meters),
              0
            ) AS today_distance_meters,
            COUNT(reward_events.id) AS today_sessions,
            COALESCE(
              MAX(exploration_sessions.distance_meters),
              0
            ) AS today_longest_session_meters,
            COALESCE(
              SUM(exploration_sessions.discovered_cells),
              0
            ) AS today_new_cells,
            COALESCE(
              MAX(reward_events.first_session_bonus),
              0
            ) AS first_session_bonus_claimed,
            COALESCE(
              MAX(reward_events.one_kilometer_bonus),
              0
            ) AS one_kilometer_bonus_claimed
          FROM reward_events
          INNER JOIN exploration_sessions
            ON exploration_sessions.id =
              reward_events.session_id
          WHERE reward_events.day_key = ?
        `,
        dayKey,
      ),
    ]);

  const levelProgress = getLevelProgress(
    progressRow.total_xp,
  );

  return {
    ...levelProgress,
    coins: progressRow.coins,
    discoveredCells: discoveredRow?.count ?? 0,
    firstSessionBonusClaimed:
      dailyRow?.first_session_bonus_claimed === 1,
    oneKilometerBonusClaimed:
      dailyRow?.one_kilometer_bonus_claimed === 1,
    rewardedSessions: progressRow.rewarded_sessions,
    todayDistanceMeters:
      dailyRow?.today_distance_meters ?? 0,
    todayLongestSessionMeters:
      dailyRow?.today_longest_session_meters ?? 0,
    todayNewCells: dailyRow?.today_new_cells ?? 0,
    todaySessions: dailyRow?.today_sessions ?? 0,
    totalDistanceMeters:
      progressRow.total_distance_meters,
  };
}

async function getPlayerProgressRow(
  database: SQLiteDatabase,
): Promise<PlayerProgressRow> {
  const row =
    await database.getFirstAsync<PlayerProgressRow>(
      `
        SELECT
          total_xp,
          coins,
          total_distance_meters,
          rewarded_sessions
        FROM player_progress
        WHERE id = 1
        LIMIT 1
      `,
    );

  return (
    row ?? {
      coins: 0,
      rewarded_sessions: 0,
      total_distance_meters: 0,
      total_xp: 0,
    }
  );
}
