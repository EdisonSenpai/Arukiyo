import type { NearbyLandmark } from "@/lib/landmarks";
import { haversineDistanceMeters } from "@/lib/landmarks";

const MAX_VISIBLE_LANDMARK_PINS = 8;
const MIN_PIN_SEPARATION_METERS = 115;

const TIER_WEIGHT = {
  iconic: 4,
  major: 3,
  notable: 2,
  local: 1,
} as const;

export function selectLandmarksForMap(
  landmarks: NearbyLandmark[],
): NearbyLandmark[] {
  const ranked = [...landmarks]
    .filter((landmark) => landmark.eligible)
    .sort((a, b) => {
      const tierDifference =
        TIER_WEIGHT[b.importanceTier] -
        TIER_WEIGHT[a.importanceTier];

      if (tierDifference !== 0) {
        return tierDifference;
      }

      const scoreDifference =
        b.importanceScore - a.importanceScore;

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      return a.distanceMeters - b.distanceMeters;
    });

  const nearest = [...ranked].sort(
    (a, b) => a.distanceMeters - b.distanceMeters,
  )[0];

  const selected: NearbyLandmark[] = [];

  if (nearest) {
    selected.push(nearest);
  }

  for (const candidate of ranked) {
    if (selected.length >= MAX_VISIBLE_LANDMARK_PINS) {
      break;
    }

    if (selected.some((item) => item.id === candidate.id)) {
      continue;
    }

    const tooClose = selected.some(
      (item) =>
        haversineDistanceMeters(
          item.latitude,
          item.longitude,
          candidate.latitude,
          candidate.longitude,
        ) < MIN_PIN_SEPARATION_METERS,
    );

    if (!tooClose) {
      selected.push(candidate);
    }
  }

  return selected.sort(
    (a, b) => a.distanceMeters - b.distanceMeters,
  );
}
