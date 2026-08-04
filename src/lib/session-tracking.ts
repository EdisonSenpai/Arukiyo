import type * as Location from "expo-location";

import type { LngLat } from "@/lib/exploration-grid";

export const MAX_GPS_ACCURACY_METERS = 45;
export const MIN_SEGMENT_DISTANCE_METERS = 3;
export const MAX_PLAUSIBLE_SPEED_METERS_PER_SECOND = 12;

const EARTH_RADIUS_METERS = 6_371_000;

export type SessionPoint = {
  accuracy: number;
  altitude: number | null;
  heading: number | null;
  latitude: number;
  longitude: number;
  sequence: number;
  speed: number | null;
  timestamp: number;
};

export type PointDecisionReason =
  | "accepted"
  | "inaccurate"
  | "stale"
  | "too-close"
  | "implausible-speed";

export type PointDecision = {
  accepted: boolean;
  reason: PointDecisionReason;
  segmentDistanceMeters: number;
};

export type RouteFeatureCollection = {
  type: "FeatureCollection";
  features: {
    type: "Feature";
    properties: {
      kind: "session-route";
    };
    geometry: {
      type: "LineString";
      coordinates: LngLat[];
    };
  }[];
};

export function locationToSessionPoint(
  location: Location.LocationObject,
  sequence: number,
): SessionPoint {
  return {
    accuracy:
      location.coords.accuracy ??
      Number.POSITIVE_INFINITY,
    altitude: location.coords.altitude,
    heading: location.coords.heading,
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    sequence,
    speed: location.coords.speed,
    timestamp: location.timestamp || Date.now(),
  };
}

export function isAccurateEnoughForDiscovery(
  location: Location.LocationObject,
): boolean {
  const accuracy = location.coords.accuracy;

  return (
    accuracy !== null &&
    Number.isFinite(accuracy) &&
    accuracy <= MAX_GPS_ACCURACY_METERS
  );
}

export function evaluateSessionPoint(
  previous: SessionPoint | null,
  candidate: SessionPoint,
): PointDecision {
  if (
    !Number.isFinite(candidate.accuracy) ||
    candidate.accuracy > MAX_GPS_ACCURACY_METERS
  ) {
    return {
      accepted: false,
      reason: "inaccurate",
      segmentDistanceMeters: 0,
    };
  }

  if (!previous) {
    return {
      accepted: true,
      reason: "accepted",
      segmentDistanceMeters: 0,
    };
  }

  const elapsedSeconds =
    (candidate.timestamp - previous.timestamp) / 1_000;

  if (elapsedSeconds <= 0) {
    return {
      accepted: false,
      reason: "stale",
      segmentDistanceMeters: 0,
    };
  }

  const distance = haversineDistanceMeters(
    previous.latitude,
    previous.longitude,
    candidate.latitude,
    candidate.longitude,
  );

  if (distance < MIN_SEGMENT_DISTANCE_METERS) {
    return {
      accepted: false,
      reason: "too-close",
      segmentDistanceMeters: 0,
    };
  }

  const calculatedSpeed = distance / elapsedSeconds;
  const reportedSpeed = candidate.speed ?? 0;
  const effectiveSpeed = Math.max(
    calculatedSpeed,
    reportedSpeed,
  );

  if (
    effectiveSpeed >
    MAX_PLAUSIBLE_SPEED_METERS_PER_SECOND
  ) {
    return {
      accepted: false,
      reason: "implausible-speed",
      segmentDistanceMeters: 0,
    };
  }

  return {
    accepted: true,
    reason: "accepted",
    segmentDistanceMeters: distance,
  };
}

export function haversineDistanceMeters(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
): number {
  const latitudeDelta = toRadians(latitudeB - latitudeA);
  const longitudeDelta = toRadians(longitudeB - longitudeA);
  const latitudeARadians = toRadians(latitudeA);
  const latitudeBRadians = toRadians(latitudeB);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitudeARadians) *
      Math.cos(latitudeBRadians) *
      Math.sin(longitudeDelta / 2) ** 2;

  return (
    2 *
    EARTH_RADIUS_METERS *
    Math.asin(Math.min(1, Math.sqrt(haversine)))
  );
}

export function createRouteFeatureCollection(
  points: SessionPoint[],
): RouteFeatureCollection {
  if (points.length < 2) {
    return {
      type: "FeatureCollection",
      features: [],
    };
  }

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          kind: "session-route",
        },
        geometry: {
          type: "LineString",
          coordinates: points.map(
            (point) =>
              [point.longitude, point.latitude] as LngLat,
          ),
        },
      },
    ],
  };
}

export function formatDistance(
  meters: number,
  locale = "en",
): string {
  if (meters < 1_000) {
    return `${Math.round(meters)} m`;
  }

  return `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(meters / 1_000)} km`;
}

export function formatDuration(
  totalSeconds: number,
): string {
  const safeSeconds = Math.max(
    0,
    Math.floor(totalSeconds),
  );
  const hours = Math.floor(safeSeconds / 3_600);
  const minutes = Math.floor(
    (safeSeconds % 3_600) / 60,
  );
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return [hours, minutes, seconds]
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
  }

  return [minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}
