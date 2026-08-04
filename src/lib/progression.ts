import {
  LEVEL_RULES,
  PROGRESSION_RULES,
} from "@/constants/progression";
import type {
  ExplorationSessionStatus,
  ExplorationSessionSummary,
} from "@/lib/exploration-db";

export type ExplorerRankKey =
  | "wanderer"
  | "pathfinder"
  | "trailblazer"
  | "voyager"
  | "worldWalker";

export type LevelProgress = {
  currentLevelXp: number;
  level: number;
  progressRatio: number;
  rankKey: ExplorerRankKey;
  totalXp: number;
  xpForNextLevel: number;
};

export type RewardEligibility = {
  firstCompletedSessionOfDay: boolean;
  firstKilometerSessionOfDay: boolean;
};

export type SessionRewardCalculation = {
  completionCoins: number;
  completionXp: number;
  dayKey: string;
  discoveryCoins: number;
  discoveryXp: number;
  distanceCoins: number;
  distanceXp: number;
  firstSessionBonus: boolean;
  firstSessionCoins: number;
  firstSessionXp: number;
  oneKilometerBonus: boolean;
  oneKilometerCoins: number;
  oneKilometerXp: number;
  totalCoins: number;
  totalXp: number;
};

export function calculateSessionReward(
  session: ExplorationSessionSummary,
  eligibility: RewardEligibility,
): SessionRewardCalculation {
  const distanceXp =
    Math.floor(
      session.distanceMeters /
        PROGRESSION_RULES.distanceXpUnitMeters,
    ) * PROGRESSION_RULES.xpPerDistanceUnit;

  const discoveryXp =
    session.discoveredCells *
    PROGRESSION_RULES.xpPerNewCell;

  const distanceCoins =
    Math.floor(
      session.distanceMeters /
        PROGRESSION_RULES.distanceCoinUnitMeters,
    ) * PROGRESSION_RULES.coinsPerDistanceUnit;

  const discoveryCoins =
    session.discoveredCells *
    PROGRESSION_RULES.coinsPerNewCell;

  const isMeaningful =
    session.distanceMeters >=
      PROGRESSION_RULES.meaningfulSessionMeters ||
    session.discoveredCells > 0;

  const isCompleted =
    session.status === "completed" && isMeaningful;

  const completionXp = isCompleted
    ? PROGRESSION_RULES.completedSessionXp
    : 0;
  const completionCoins = isCompleted
    ? PROGRESSION_RULES.completedSessionCoins
    : 0;

  const firstSessionBonus =
    isCompleted &&
    eligibility.firstCompletedSessionOfDay;

  const firstSessionXp = firstSessionBonus
    ? PROGRESSION_RULES.firstSessionOfDayXp
    : 0;
  const firstSessionCoins = firstSessionBonus
    ? PROGRESSION_RULES.firstSessionOfDayCoins
    : 0;

  const oneKilometerBonus =
    isCompleted &&
    session.distanceMeters >=
      PROGRESSION_RULES.oneKilometerMeters &&
    eligibility.firstKilometerSessionOfDay;

  const oneKilometerXp = oneKilometerBonus
    ? PROGRESSION_RULES.oneKilometerOfDayXp
    : 0;
  const oneKilometerCoins = oneKilometerBonus
    ? PROGRESSION_RULES.oneKilometerOfDayCoins
    : 0;

  return {
    completionCoins,
    completionXp,
    dayKey: toLocalDayKey(
      session.endedAt ?? session.startedAt,
    ),
    discoveryCoins,
    discoveryXp,
    distanceCoins,
    distanceXp,
    firstSessionBonus,
    firstSessionCoins,
    firstSessionXp,
    oneKilometerBonus,
    oneKilometerCoins,
    oneKilometerXp,
    totalCoins:
      distanceCoins +
      discoveryCoins +
      completionCoins +
      firstSessionCoins +
      oneKilometerCoins,
    totalXp:
      distanceXp +
      discoveryXp +
      completionXp +
      firstSessionXp +
      oneKilometerXp,
  };
}

export function getLevelProgress(
  totalXp: number,
): LevelProgress {
  let level = 1;
  let remainingXp = Math.max(0, Math.floor(totalXp));
  let requiredXp = xpRequiredForNextLevel(level);

  while (remainingXp >= requiredXp) {
    remainingXp -= requiredXp;
    level += 1;
    requiredXp = xpRequiredForNextLevel(level);
  }

  return {
    currentLevelXp: remainingXp,
    level,
    progressRatio:
      requiredXp === 0
        ? 0
        : Math.min(1, remainingXp / requiredXp),
    rankKey: rankForLevel(level),
    totalXp: Math.max(0, Math.floor(totalXp)),
    xpForNextLevel: requiredXp,
  };
}

export function xpRequiredForNextLevel(
  currentLevel: number,
): number {
  return (
    LEVEL_RULES.firstLevelXp +
    Math.max(0, currentLevel - 1) *
      LEVEL_RULES.additionalXpPerLevel
  );
}

export function rankForLevel(
  level: number,
): ExplorerRankKey {
  if (level >= 35) {
    return "worldWalker";
  }

  if (level >= 20) {
    return "voyager";
  }

  if (level >= 10) {
    return "trailblazer";
  }

  if (level >= 5) {
    return "pathfinder";
  }

  return "wanderer";
}

export function toLocalDayKey(
  isoTimestamp: string,
): string {
  const date = new Date(isoTimestamp);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(
    2,
    "0",
  );
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function isCompletedStatus(
  status: ExplorationSessionStatus,
): boolean {
  return status === "completed";
}
