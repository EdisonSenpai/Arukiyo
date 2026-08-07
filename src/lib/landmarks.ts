import {
  LANDMARK_MIN_CACHE_SCORE,
  LANDMARK_MIN_IMPORTANCE_SCORE,
} from "@/constants/landmarks";

export type LandmarkSourceType =
  | "node"
  | "way"
  | "relation";

export type LandmarkCategory =
  | "historic"
  | "museum"
  | "culture"
  | "civic"
  | "education"
  | "religious"
  | "attraction"
  | "landmark";

export type LandmarkImportanceTier =
  | "local"
  | "notable"
  | "major"
  | "iconic";

export type LandmarkRecord = {
  category: LandmarkCategory;
  eligible: boolean;
  firstSeenAt: string;
  id: string;
  importanceScore: number;
  importanceTier: LandmarkImportanceTier;
  lastSeenAt: string;
  latitude: number;
  longitude: number;
  name: string;
  officialUrl: string | null;
  sourceId: number;
  sourceType: LandmarkSourceType;
  sourceUrl: string;
  tags: Record<string, string>;
  wikidataId: string | null;
  wikipediaTag: string | null;
};

export type NearbyLandmark = LandmarkRecord & {
  distanceMeters: number;
};

export type OverpassElement = {
  center?: {
    lat?: number;
    lon?: number;
  };
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
  type: LandmarkSourceType;
};

export type LandmarkNormalizationResult = {
  accepted: LandmarkRecord[];
  eligibleCount: number;
  rawCandidateCount: number;
};

export function normalizeOverpassElements(
  elements: OverpassElement[],
  seenAt = new Date().toISOString(),
): LandmarkNormalizationResult {
  const accepted: LandmarkRecord[] = [];

  for (const element of elements) {
    const candidate = classifyOverpassElement(
      element,
      seenAt,
    );

    if (candidate) {
      accepted.push(candidate);
    }
  }

  const deduplicated = deduplicateLandmarks(accepted);

  return {
    accepted: deduplicated,
    eligibleCount: deduplicated.filter(
      (landmark) => landmark.eligible,
    ).length,
    rawCandidateCount: elements.length,
  };
}

export function classifyOverpassElement(
  element: OverpassElement,
  seenAt = new Date().toISOString(),
): LandmarkRecord | null {
  const tags = element.tags ?? {};
  const name = normalizeText(tags.name);

  if (!name) {
    return null;
  }

  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;

  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  const result = scoreLandmark(tags);

  if (result.score < LANDMARK_MIN_CACHE_SCORE) {
    return null;
  }

  const sourceType = element.type;
  const sourceId = element.id;
  const id = `osm:${sourceType}:${sourceId}`;

  return {
    category: result.category,
    eligible:
      result.score >= LANDMARK_MIN_IMPORTANCE_SCORE,
    firstSeenAt: seenAt,
    id,
    importanceScore: result.score,
    importanceTier: importanceTierForScore(
      result.score,
    ),
    lastSeenAt: seenAt,
    latitude,
    longitude,
    name,
    officialUrl: normalizeOfficialUrl(
      tags.website ?? tags["contact:website"],
    ),
    sourceId,
    sourceType,
    sourceUrl:
      `https://www.openstreetmap.org/${sourceType}/${sourceId}`,
    tags,
    wikidataId: normalizeText(tags.wikidata),
    wikipediaTag: normalizeText(tags.wikipedia),
  };
}

export function scoreLandmark(
  tags: Record<string, string>,
): {
  category: LandmarkCategory;
  score: number;
} {
  let score = 0;

  const historic = tags.historic;
  const tourism = tags.tourism;
  const amenity = tags.amenity;
  const building = tags.building;

  if (historic) {
    score += historicScore(historic);
  }

  if (tags.heritage) {
    score += 35;
  }

  if (tags.wikidata) {
    score += 25;
  }

  if (tags.wikipedia) {
    score += 20;
  }

  if (tags.website || tags["contact:website"]) {
    score += 10;
  }

  if (tags.memorial) {
    score += 20;
  }

  switch (tourism) {
    case "museum":
      score += 40;
      break;
    case "attraction":
      score += 30;
      break;
    case "gallery":
      score += 30;
      break;
    case "artwork":
      score += 18;
      break;
    default:
      break;
  }

  switch (amenity) {
    case "theatre":
    case "arts_centre":
      score += 30;
      break;
    case "townhall":
      score += 28;
      break;
    case "university":
      score += 22;
      break;
    case "library":
      score += 16;
      break;
    case "place_of_worship":
      score += 10;
      break;
    default:
      break;
  }

  switch (building) {
    case "cathedral":
      score += 40;
      break;
    case "church":
      score += 12;
      break;
    case "civic":
      score += 22;
      break;
    case "university":
      score += 18;
      break;
    case "public":
      score += 10;
      break;
    default:
      break;
  }

  return {
    category: categoryForTags(tags),
    score,
  };
}

export function importanceTierForScore(
  score: number,
): LandmarkImportanceTier {
  if (score >= 100) {
    return "iconic";
  }

  if (score >= 80) {
    return "major";
  }

  if (score >= 60) {
    return "notable";
  }

  return "local";
}

export function haversineDistanceMeters(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
): number {
  const earthRadiusMeters = 6_371_000;
  const toRadians = (value: number) =>
    (value * Math.PI) / 180;

  const latitudeDelta = toRadians(
    latitudeB - latitudeA,
  );
  const longitudeDelta = toRadians(
    longitudeB - longitudeA,
  );

  const latA = toRadians(latitudeA);
  const latB = toRadians(latitudeB);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latA) *
      Math.cos(latB) *
      Math.sin(longitudeDelta / 2) ** 2;

  return (
    2 *
    earthRadiusMeters *
    Math.atan2(
      Math.sqrt(haversine),
      Math.sqrt(1 - haversine),
    )
  );
}

export function wikipediaUrlFromTag(
  wikipediaTag: string | null,
): string | null {
  if (!wikipediaTag) {
    return null;
  }

  const separator = wikipediaTag.indexOf(":");

  if (separator <= 0) {
    return null;
  }

  const language = wikipediaTag
    .slice(0, separator)
    .trim()
    .toLowerCase();
  const page = wikipediaTag
    .slice(separator + 1)
    .trim();

  if (!language || !page) {
    return null;
  }

  return `https://${language}.wikipedia.org/wiki/${encodeURIComponent(
    page.replace(/ /g, "_"),
  )}`;
}

function historicScore(value: string): number {
  switch (value) {
    case "castle":
    case "archaeological_site":
      return 50;
    case "monument":
    case "fort":
      return 45;
    case "memorial":
      return 40;
    case "ruins":
    case "manor":
      return 35;
    case "church":
    case "building":
      return 32;
    case "yes":
      return 30;
    default:
      return 28;
  }
}

function categoryForTags(
  tags: Record<string, string>,
): LandmarkCategory {
  if (tags.tourism === "museum") {
    return "museum";
  }

  if (tags.historic || tags.heritage) {
    return "historic";
  }

  if (
    tags.tourism === "gallery" ||
    tags.amenity === "theatre" ||
    tags.amenity === "arts_centre"
  ) {
    return "culture";
  }

  if (
    tags.amenity === "townhall" ||
    tags.building === "civic" ||
    tags.building === "public"
  ) {
    return "civic";
  }

  if (
    tags.amenity === "university" ||
    tags.amenity === "library" ||
    tags.building === "university"
  ) {
    return "education";
  }

  if (
    tags.amenity === "place_of_worship" ||
    tags.building === "cathedral" ||
    tags.building === "church"
  ) {
    return "religious";
  }

  if (
    tags.tourism === "attraction" ||
    tags.tourism === "artwork"
  ) {
    return "attraction";
  }

  return "landmark";
}

function deduplicateLandmarks(
  landmarks: LandmarkRecord[],
): LandmarkRecord[] {
  const sorted = [...landmarks].sort(
    (a, b) => b.importanceScore - a.importanceScore,
  );
  const result: LandmarkRecord[] = [];

  for (const candidate of sorted) {
    const duplicate = result.some((existing) => {
      if (
        normalizeComparisonName(existing.name) !==
        normalizeComparisonName(candidate.name)
      ) {
        return false;
      }

      return (
        haversineDistanceMeters(
          existing.latitude,
          existing.longitude,
          candidate.latitude,
          candidate.longitude,
        ) <= 35
      );
    });

    if (!duplicate) {
      result.push(candidate);
    }
  }

  return result;
}

function normalizeComparisonName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function normalizeOfficialUrl(
  value: string | undefined,
): string | null {
  const normalized = normalizeText(value);

  if (!normalized) {
    return null;
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  if (/^www\./i.test(normalized)) {
    return `https://${normalized}`;
  }

  return null;
}

function normalizeText(
  value: string | undefined,
): string | null {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}
