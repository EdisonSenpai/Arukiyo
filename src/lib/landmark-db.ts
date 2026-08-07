import type { SQLiteDatabase } from "expo-sqlite";

import {
  LANDMARK_SCAN_RADIUS_METERS,
} from "@/constants/landmarks";
import {
  haversineDistanceMeters,
  type LandmarkCategory,
  type LandmarkImportanceTier,
  type LandmarkRecord,
  type LandmarkSourceType,
  type NearbyLandmark,
} from "@/lib/landmarks";

type LandmarkRow = {
  category: LandmarkCategory;
  eligible: number;
  first_seen_at: string;
  id: string;
  importance_score: number;
  importance_tier: LandmarkImportanceTier;
  last_seen_at: string;
  latitude: number;
  longitude: number;
  name: string;
  official_url: string | null;
  source_id: number;
  source_type: LandmarkSourceType;
  source_url: string;
  tags_json: string;
  wikidata_id: string | null;
  wikipedia_tag: string | null;
};

type ScanStateRow = {
  center_latitude: number;
  center_longitude: number;
  endpoint: string | null;
  fetched_at: string;
  radius_meters: number;
  raw_candidate_count: number;
  stored_candidate_count: number;
};

export type LandmarkScanState = {
  centerLatitude: number;
  centerLongitude: number;
  endpoint: string | null;
  fetchedAt: string;
  radiusMeters: number;
  rawCandidateCount: number;
  storedCandidateCount: number;
};

export async function ensureLandmarkDatabase(
  database: SQLiteDatabase,
): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS landmarks (
      id TEXT PRIMARY KEY NOT NULL,
      source_type TEXT NOT NULL,
      source_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      category TEXT NOT NULL,
      importance_score INTEGER NOT NULL,
      importance_tier TEXT NOT NULL,
      eligible INTEGER NOT NULL DEFAULT 0,
      wikidata_id TEXT,
      wikipedia_tag TEXT,
      official_url TEXT,
      source_url TEXT NOT NULL,
      tags_json TEXT NOT NULL,
      first_seen_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      UNIQUE (source_type, source_id)
    );

    CREATE INDEX IF NOT EXISTS idx_landmarks_coordinates
      ON landmarks (latitude, longitude);

    CREATE INDEX IF NOT EXISTS idx_landmarks_eligible
      ON landmarks (eligible, importance_score DESC);

    CREATE TABLE IF NOT EXISTS landmark_scan_state (
      id INTEGER PRIMARY KEY NOT NULL
        CHECK (id = 1),
      center_latitude REAL NOT NULL,
      center_longitude REAL NOT NULL,
      radius_meters INTEGER NOT NULL,
      fetched_at TEXT NOT NULL,
      endpoint TEXT,
      raw_candidate_count INTEGER NOT NULL DEFAULT 0,
      stored_candidate_count INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS landmark_unlocks (
      landmark_id TEXT PRIMARY KEY NOT NULL,
      session_id TEXT,
      unlocked_at TEXT NOT NULL,
      unlock_distance_meters REAL,
      gps_accuracy_meters REAL,
      FOREIGN KEY (landmark_id)
        REFERENCES landmarks (id)
        ON DELETE CASCADE,
      FOREIGN KEY (session_id)
        REFERENCES exploration_sessions (id)
        ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_landmark_unlocks_date
      ON landmark_unlocks (unlocked_at DESC);
  `);
}

export async function upsertLandmarks(
  database: SQLiteDatabase,
  landmarks: LandmarkRecord[],
): Promise<void> {
  if (landmarks.length === 0) {
    return;
  }

  await database.withTransactionAsync(async () => {
    for (const landmark of landmarks) {
      await database.runAsync(
        `
          INSERT INTO landmarks (
            id,
            source_type,
            source_id,
            name,
            latitude,
            longitude,
            category,
            importance_score,
            importance_tier,
            eligible,
            wikidata_id,
            wikipedia_tag,
            official_url,
            source_url,
            tags_json,
            first_seen_at,
            last_seen_at
          )
          VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
          )
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            latitude = excluded.latitude,
            longitude = excluded.longitude,
            category = excluded.category,
            importance_score = excluded.importance_score,
            importance_tier = excluded.importance_tier,
            eligible = excluded.eligible,
            wikidata_id = excluded.wikidata_id,
            wikipedia_tag = excluded.wikipedia_tag,
            official_url = excluded.official_url,
            source_url = excluded.source_url,
            tags_json = excluded.tags_json,
            last_seen_at = excluded.last_seen_at
        `,
        landmark.id,
        landmark.sourceType,
        landmark.sourceId,
        landmark.name,
        landmark.latitude,
        landmark.longitude,
        landmark.category,
        landmark.importanceScore,
        landmark.importanceTier,
        landmark.eligible ? 1 : 0,
        landmark.wikidataId,
        landmark.wikipediaTag,
        landmark.officialUrl,
        landmark.sourceUrl,
        JSON.stringify(landmark.tags),
        landmark.firstSeenAt,
        landmark.lastSeenAt,
      );
    }
  });
}

export async function saveLandmarkScanState(
  database: SQLiteDatabase,
  state: LandmarkScanState,
): Promise<void> {
  await database.runAsync(
    `
      INSERT INTO landmark_scan_state (
        id,
        center_latitude,
        center_longitude,
        radius_meters,
        fetched_at,
        endpoint,
        raw_candidate_count,
        stored_candidate_count
      )
      VALUES (1, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        center_latitude = excluded.center_latitude,
        center_longitude = excluded.center_longitude,
        radius_meters = excluded.radius_meters,
        fetched_at = excluded.fetched_at,
        endpoint = excluded.endpoint,
        raw_candidate_count = excluded.raw_candidate_count,
        stored_candidate_count = excluded.stored_candidate_count
    `,
    state.centerLatitude,
    state.centerLongitude,
    state.radiusMeters,
    state.fetchedAt,
    state.endpoint,
    state.rawCandidateCount,
    state.storedCandidateCount,
  );
}

export async function getLandmarkScanState(
  database: SQLiteDatabase,
): Promise<LandmarkScanState | null> {
  const row =
    await database.getFirstAsync<ScanStateRow>(
      `
        SELECT
          center_latitude,
          center_longitude,
          radius_meters,
          fetched_at,
          endpoint,
          raw_candidate_count,
          stored_candidate_count
        FROM landmark_scan_state
        WHERE id = 1
        LIMIT 1
      `,
    );

  if (!row) {
    return null;
  }

  return {
    centerLatitude: row.center_latitude,
    centerLongitude: row.center_longitude,
    endpoint: row.endpoint,
    fetchedAt: row.fetched_at,
    radiusMeters: row.radius_meters,
    rawCandidateCount: row.raw_candidate_count,
    storedCandidateCount: row.stored_candidate_count,
  };
}

export async function listNearbyLandmarks(
  database: SQLiteDatabase,
  latitude: number,
  longitude: number,
  radiusMeters = LANDMARK_SCAN_RADIUS_METERS,
): Promise<NearbyLandmark[]> {
  const latitudeDelta = radiusMeters / 111_320;
  const longitudeScale = Math.max(
    0.2,
    Math.cos((latitude * Math.PI) / 180),
  );
  const longitudeDelta =
    radiusMeters / (111_320 * longitudeScale);

  const rows = await database.getAllAsync<LandmarkRow>(
    `
      SELECT
        id,
        source_type,
        source_id,
        name,
        latitude,
        longitude,
        category,
        importance_score,
        importance_tier,
        eligible,
        wikidata_id,
        wikipedia_tag,
        official_url,
        source_url,
        tags_json,
        first_seen_at,
        last_seen_at
      FROM landmarks
      WHERE latitude BETWEEN ? AND ?
        AND longitude BETWEEN ? AND ?
      ORDER BY importance_score DESC
    `,
    latitude - latitudeDelta,
    latitude + latitudeDelta,
    longitude - longitudeDelta,
    longitude + longitudeDelta,
  );

  return rows
    .map((row) => {
      const landmark = mapLandmarkRow(row);
      const distanceMeters =
        haversineDistanceMeters(
          latitude,
          longitude,
          landmark.latitude,
          landmark.longitude,
        );

      return {
        ...landmark,
        distanceMeters,
      };
    })
    .filter(
      (landmark) =>
        landmark.distanceMeters <= radiusMeters,
    )
    .sort((a, b) => {
      if (a.eligible !== b.eligible) {
        return a.eligible ? -1 : 1;
      }

      if (a.distanceMeters !== b.distanceMeters) {
        return a.distanceMeters - b.distanceMeters;
      }

      return (
        b.importanceScore - a.importanceScore
      );
    });
}

function mapLandmarkRow(
  row: LandmarkRow,
): LandmarkRecord {
  let tags: Record<string, string> = {};

  try {
    tags = JSON.parse(row.tags_json) as Record<
      string,
      string
    >;
  } catch {
    tags = {};
  }

  return {
    category: row.category,
    eligible: row.eligible === 1,
    firstSeenAt: row.first_seen_at,
    id: row.id,
    importanceScore: row.importance_score,
    importanceTier: row.importance_tier,
    lastSeenAt: row.last_seen_at,
    latitude: row.latitude,
    longitude: row.longitude,
    name: row.name,
    officialUrl: row.official_url,
    sourceId: row.source_id,
    sourceType: row.source_type,
    sourceUrl: row.source_url,
    tags,
    wikidataId: row.wikidata_id,
    wikipediaTag: row.wikipedia_tag,
  };
}
