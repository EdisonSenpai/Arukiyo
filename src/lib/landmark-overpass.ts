import {
  ARUKIYO_OVERPASS_USER_AGENT,
  LANDMARK_SCAN_RADIUS_METERS,
  OVERPASS_ENDPOINTS,
} from "@/constants/landmarks";
import {
  normalizeOverpassElements,
  type LandmarkNormalizationResult,
  type OverpassElement,
} from "@/lib/landmarks";

type OverpassResponse = {
  elements?: OverpassElement[];
};

export type LandmarkFetchResult =
  LandmarkNormalizationResult & {
    endpoint: string;
    fetchedAt: string;
  };

export async function fetchNearbyLandmarkCandidates(
  latitude: number,
  longitude: number,
  radiusMeters = LANDMARK_SCAN_RADIUS_METERS,
): Promise<LandmarkFetchResult> {
  const query = buildLandmarkOverpassQuery(
    latitude,
    longitude,
    radiusMeters,
  );

  let lastError: unknown = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetchWithTimeout(
        endpoint,
        query,
      );
      const fetchedAt = new Date().toISOString();
      const normalized = normalizeOverpassElements(
        response.elements ?? [],
        fetchedAt,
      );

      return {
        ...normalized,
        endpoint,
        fetchedAt,
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Overpass request failed.");
}

export function buildLandmarkOverpassQuery(
  latitude: number,
  longitude: number,
  radiusMeters: number,
): string {
  const around =
    `(around:${Math.round(radiusMeters)},` +
    `${latitude.toFixed(6)},${longitude.toFixed(6)})`;

  return `
[out:json][timeout:20];
(
  nwr${around}["name"]["historic"];
  nwr${around}["name"]["heritage"];
  nwr${around}["name"]["tourism"~"^(attraction|museum|gallery|artwork)$"];
  nwr${around}["name"]["amenity"~"^(theatre|arts_centre|townhall|university|library|place_of_worship)$"];
  nwr${around}["name"]["building"~"^(cathedral|church|civic|university|public)$"];
  nwr${around}["name"]["wikidata"];
  nwr${around}["name"]["wikipedia"];
);
out tags center qt;
`.trim();
}

async function fetchWithTimeout(
  endpoint: string,
  query: string,
): Promise<OverpassResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    22_000,
  );

  try {
    const response = await fetch(endpoint, {
      body: `data=${encodeURIComponent(query)}`,
      headers: {
        Accept: "application/json",
        "Content-Type":
          "application/x-www-form-urlencoded;charset=UTF-8",
        "User-Agent": ARUKIYO_OVERPASS_USER_AGENT,
      },
      method: "POST",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        `Overpass returned HTTP ${response.status}.`,
      );
    }

    return (await response.json()) as OverpassResponse;
  } finally {
    clearTimeout(timeout);
  }
}
