import {
  cellToBoundary,
  gridDisk,
  latLngToCell,
} from "h3-js";

import {
  CURRENT_VIEW_RADIUS,
  H3_RESOLUTION,
  HOME_ZONE_RADIUS,
} from "@/constants/exploration";

export type LngLat = [number, number];

type CellState = "current" | "explored" | "fog";

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

export type PointFeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: Record<string, string | number | boolean>;
    geometry: {
      type: "Point";
      coordinates: LngLat;
    };
  }>;
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

export function visibleGridCells(
  homeCell: string | null,
  currentCell: string | null,
): string[] {
  const values = new Set<string>();

  if (homeCell) {
    for (const cell of gridDisk(homeCell, HOME_ZONE_RADIUS)) {
      values.add(cell);
    }
  }

  if (currentCell) {
    const radius = homeCell
      ? CURRENT_VIEW_RADIUS
      : HOME_ZONE_RADIUS;

    for (const cell of gridDisk(currentCell, radius)) {
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
  return {
    type: "FeatureCollection",
    features: cellIds.map((cellId) => {
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
