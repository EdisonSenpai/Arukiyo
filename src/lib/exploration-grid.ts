import {
  cellToBoundary,
  gridDisk,
  latLngToCell,
} from "h3-js";

import {
  FOG_VIEW_RADIUS,
  H3_RESOLUTION,
  HOME_ZONE_RADIUS,
} from "@/constants/exploration";

export type LngLat = [number, number];

type CellState = "current" | "explored" | "home" | "fog";

export type CellFeature = {
  type: "Feature";
  id: string;
  properties: {
    cellId: string;
    state: CellState;
  };
  geometry: {
    type: "Polygon";
    coordinates: LngLat[][];
  };
};

export type CellFeatureCollection = {
  type: "FeatureCollection";
  features: CellFeature[];
};

export type FogMaskFeatureCollection = {
  type: "FeatureCollection";
  features: [
    {
      type: "Feature";
      properties: {
        kind: "fog-mask";
      };
      geometry: {
        type: "Polygon";
        coordinates: LngLat[][];
      };
    },
  ];
};

export type PointFeatureCollection = {
  type: "FeatureCollection";
  features: {
    type: "Feature";
    properties: Record<string, string | number | boolean>;
    geometry: {
      type: "Point";
      coordinates: LngLat;
    };
  }[];
};

export function locationToCell(
  latitude: number,
  longitude: number,
): string {
  return latLngToCell(latitude, longitude, H3_RESOLUTION);
}

export function homeZoneCells(centerCell: string | null): string[] {
  return centerCell ? gridDisk(centerCell, HOME_ZONE_RADIUS) : [];
}

export function applyHomeZoneState(
  collection: CellFeatureCollection,
  homeCell: string | null,
): CellFeatureCollection {
  if (!homeCell) {
    return collection;
  }

  const homeCells = new Set(homeZoneCells(homeCell));

  return {
    ...collection,
    features: collection.features.map((feature) => {
      if (
        feature.properties.state !== "fog" ||
        !homeCells.has(feature.properties.cellId)
      ) {
        return feature;
      }

      return {
        ...feature,
        properties: {
          ...feature.properties,
          state: "home" as const,
        },
      };
    }),
  };
}

export function visibleGridCells(
  homeCell: string | null,
  currentCell: string | null,
): string[] {
  const values = new Set<string>();
  const centers = new Set<string>();

  if (homeCell) {
    centers.add(homeCell);
  }

  if (currentCell) {
    centers.add(currentCell);
  }

  for (const center of centers) {
    for (const cell of gridDisk(center, FOG_VIEW_RADIUS)) {
      values.add(cell);
    }
  }

  return [...values];
}

export function createCellFeatureCollection(
  cellIds: string[],
  exploredCellIds: Set<string>,
  currentCell: string | null,
): CellFeatureCollection {
  const renderedCellIds = new Set(cellIds);

  for (const exploredCellId of exploredCellIds) {
    renderedCellIds.add(exploredCellId);
  }

  return {
    type: "FeatureCollection",
    features: [...renderedCellIds].map((cellId) => {
      const boundary = cellToBoundary(cellId);
      const ring: LngLat[] = boundary.map(
        ([latitude, longitude]) => [longitude, latitude],
      );

      if (ring.length > 0) {
        ring.push([...ring[0]] as LngLat);
      }

      const state: CellState =
        cellId === currentCell
          ? "current"
          : exploredCellIds.has(cellId)
            ? "explored"
            : "fog";

      return {
        type: "Feature",
        id: cellId,
        properties: {
          cellId,
          state,
        },
        geometry: {
          type: "Polygon",
          coordinates: [ring],
        },
      };
    }),
  };
}

export function createFogMaskFeatureCollection(
  collection: CellFeatureCollection,
): FogMaskFeatureCollection {
  const worldRing: LngLat[] = [
    [-180, -85],
    [180, -85],
    [180, 85],
    [-180, 85],
    [-180, -85],
  ];

  const revealedRings = collection.features
    .filter((feature) => feature.properties.state !== "fog")
    .map((feature) =>
      orientRing(
        feature.geometry.coordinates[0] ?? [],
        true,
      ),
    )
    .filter((ring) => ring.length >= 4);

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          kind: "fog-mask",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            orientRing(worldRing, false),
            ...revealedRings,
          ],
        },
      },
    ],
  };
}

function orientRing(
  ring: LngLat[],
  clockwise: boolean,
): LngLat[] {
  if (ring.length < 4) {
    return ring;
  }

  const normalized = ring.map(
    ([longitude, latitude]) =>
      [longitude, latitude] as LngLat,
  );

  const first = normalized[0];
  const last = normalized[normalized.length - 1];

  if (
    first[0] !== last[0] ||
    first[1] !== last[1]
  ) {
    normalized.push([...first] as LngLat);
  }

  const area = signedRingArea(normalized);
  const isClockwise = area < 0;

  if (isClockwise === clockwise) {
    return normalized;
  }

  return [...normalized].reverse();
}

function signedRingArea(ring: LngLat[]): number {
  let area = 0;

  for (let index = 0; index < ring.length - 1; index += 1) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[index + 1];

    area += x1 * y2 - x2 * y1;
  }

  return area / 2;
}

export function createPointFeatureCollection(
  longitude: number,
  latitude: number,
  properties: Record<string, string | number | boolean> = {},
): PointFeatureCollection {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties,
        geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
      },
    ],
  };
}
