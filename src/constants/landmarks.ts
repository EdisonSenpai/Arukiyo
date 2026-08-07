export const LANDMARK_SCAN_RADIUS_METERS = 1_600;
export const LANDMARK_SCAN_REUSE_DISTANCE_METERS = 450;
export const LANDMARK_SCAN_TTL_MS = 6 * 60 * 60 * 1_000;
export const LANDMARK_UNLOCK_RADIUS_METERS = 60;
export const LANDMARK_MIN_IMPORTANCE_SCORE = 45;
export const LANDMARK_MIN_CACHE_SCORE = 15;

export const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
] as const;

export const ARUKIYO_OVERPASS_USER_AGENT =
  "Arukiyo/0.4C1 (development; https://github.com/EdisonSenpai/Arukiyo)";
