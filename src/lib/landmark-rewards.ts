import type { LandmarkImportanceTier } from "@/lib/landmarks";

export type LandmarkReward = {
  coins: number;
  sakuraShards: number;
  xp: number;
};

export function rewardForLandmarkTier(
  tier: LandmarkImportanceTier,
): LandmarkReward {
  switch (tier) {
    case "iconic":
      return { coins: 30, sakuraShards: 5, xp: 150 };
    case "major":
      return { coins: 18, sakuraShards: 3, xp: 90 };
    case "notable":
      return { coins: 10, sakuraShards: 2, xp: 50 };
    case "local":
    default:
      return { coins: 5, sakuraShards: 1, xp: 25 };
  }
}
