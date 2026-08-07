import type { SQLiteDatabase } from "expo-sqlite";

import { LANDMARK_SCAN_RADIUS_METERS } from "@/constants/landmarks";
import {
  rewardForLandmarkTier,
  type LandmarkReward,
} from "@/lib/landmark-rewards";
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

type PlayerCurrencyRow = {
  coins: number;
  sakura_shards: number;
  total_xp: number;
};

type UnlockRow = {
  landmark_id: string;
};

type UnlockedLandmarkRow = LandmarkRow & {
  gps_accuracy_meters: number | null;
  reward_coins: number;
  reward_sakura_shards: number;
  reward_xp: number;
  session_distance_meters: number | null;
  session_duration_seconds: number | null;
  session_id: string | null;
  session_started_at: string | null;
  unlock_distance_meters: number | null;
  unlocked_at: string;
};

type LandmarkContentRow = {
  fetched_at: string;
  image_url: string | null;
  language: string;
  landmark_id: string;
  source_language: string | null;
  summary: string | null;
  title: string | null;
  wikipedia_url: string | null;
  wikidata_description: string | null;
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

export type LandmarkUnlockResult = {
  landmark: LandmarkRecord;
  reward: LandmarkReward;
  totals: {
    coins: number;
    sakuraShards: number;
    xp: number;
  };
  unlockedAt: string;
};

export type UnlockedLandmarkSummary = LandmarkRecord & {
  discovery: {
    gpsAccuracyMeters: number | null;
    reward: LandmarkReward;
    sessionDistanceMeters: number | null;
    sessionDurationSeconds: number | null;
    sessionId: string | null;
    sessionStartedAt: string | null;
    unlockDistanceMeters: number | null;
    unlockedAt: string;
  };
};

export type LandmarkContentCache = {
  fetchedAt: string;
  imageUrl: string | null;
  language: string;
  landmarkId: string;
  sourceLanguage: string | null;
  summary: string | null;
  title: string | null;
  wikipediaUrl: string | null;
  wikidataDescription: string | null;
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
      id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
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
      reward_xp INTEGER NOT NULL DEFAULT 0,
      reward_coins INTEGER NOT NULL DEFAULT 0,
      reward_sakura_shards INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (landmark_id)
        REFERENCES landmarks (id)
        ON DELETE CASCADE,
      FOREIGN KEY (session_id)
        REFERENCES exploration_sessions (id)
        ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_landmark_unlocks_date
      ON landmark_unlocks (unlocked_at DESC);

    CREATE TABLE IF NOT EXISTS landmark_content_cache (
      landmark_id TEXT NOT NULL,
      language TEXT NOT NULL,
      source_language TEXT,
      title TEXT,
      summary TEXT,
      image_url TEXT,
      wikipedia_url TEXT,
      wikidata_description TEXT,
      fetched_at TEXT NOT NULL,
      PRIMARY KEY (landmark_id, language),
      FOREIGN KEY (landmark_id)
        REFERENCES landmarks (id)
        ON DELETE CASCADE
    );
  `);

  await ensureColumn(
    database,
    "landmark_unlocks",
    "reward_xp",
    "INTEGER NOT NULL DEFAULT 0",
  );
  await ensureColumn(
    database,
    "landmark_unlocks",
    "reward_coins",
    "INTEGER NOT NULL DEFAULT 0",
  );
  await ensureColumn(
    database,
    "landmark_unlocks",
    "reward_sakura_shards",
    "INTEGER NOT NULL DEFAULT 0",
  );
  await ensureColumn(
    database,
    "player_progress",
    "sakura_shards",
    "INTEGER NOT NULL DEFAULT 0",
  );
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
            id, source_type, source_id, name, latitude, longitude,
            category, importance_score, importance_tier, eligible,
            wikidata_id, wikipedia_tag, official_url, source_url,
            tags_json, first_seen_at, last_seen_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        id, center_latitude, center_longitude, radius_meters,
        fetched_at, endpoint, raw_candidate_count, stored_candidate_count
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
  const row = await database.getFirstAsync<ScanStateRow>(
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

      return b.importanceScore - a.importanceScore;
    });
}

export async function loadUnlockedLandmarkIds(
  database: SQLiteDatabase,
): Promise<Set<string>> {
  await ensureLandmarkDatabase(database);

  const rows = await database.getAllAsync<UnlockRow>(
    "SELECT landmark_id FROM landmark_unlocks",
  );

  return new Set(rows.map((row) => row.landmark_id));
}

export async function unlockLandmark(
  database: SQLiteDatabase,
  landmark: LandmarkRecord,
  options: {
    distanceMeters: number;
    gpsAccuracyMeters: number | null;
    sessionId: string;
  },
): Promise<LandmarkUnlockResult | null> {
  await ensureLandmarkDatabase(database);

  const reward = rewardForLandmarkTier(
    landmark.importanceTier,
  );
  const unlockedAt = new Date().toISOString();
  let inserted = false;

  await database.withTransactionAsync(async () => {
    const result = await database.runAsync(
      `
        INSERT OR IGNORE INTO landmark_unlocks (
          landmark_id,
          session_id,
          unlocked_at,
          unlock_distance_meters,
          gps_accuracy_meters,
          reward_xp,
          reward_coins,
          reward_sakura_shards
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      landmark.id,
      options.sessionId,
      unlockedAt,
      options.distanceMeters,
      options.gpsAccuracyMeters,
      reward.xp,
      reward.coins,
      reward.sakuraShards,
    );

    if (result.changes === 0) {
      return;
    }

    inserted = true;

    await database.runAsync(
      `
        UPDATE player_progress
        SET
          total_xp = total_xp + ?,
          coins = coins + ?,
          sakura_shards = sakura_shards + ?,
          updated_at = ?
        WHERE id = 1
      `,
      reward.xp,
      reward.coins,
      reward.sakuraShards,
      unlockedAt,
    );
  });

  if (!inserted) {
    return null;
  }

  const totals =
    await database.getFirstAsync<PlayerCurrencyRow>(
      `
        SELECT total_xp, coins, sakura_shards
        FROM player_progress
        WHERE id = 1
        LIMIT 1
      `,
    );

  return {
    landmark,
    reward,
    totals: {
      coins: totals?.coins ?? reward.coins,
      sakuraShards:
        totals?.sakura_shards ?? reward.sakuraShards,
      xp: totals?.total_xp ?? reward.xp,
    },
    unlockedAt,
  };
}


export async function listUnlockedLandmarks(
  database: SQLiteDatabase,
): Promise<UnlockedLandmarkSummary[]> {
  await ensureLandmarkDatabase(database);

  const rows =
    await database.getAllAsync<UnlockedLandmarkRow>(
      `
        SELECT
          landmarks.id,
          landmarks.source_type,
          landmarks.source_id,
          landmarks.name,
          landmarks.latitude,
          landmarks.longitude,
          landmarks.category,
          landmarks.importance_score,
          landmarks.importance_tier,
          landmarks.eligible,
          landmarks.wikidata_id,
          landmarks.wikipedia_tag,
          landmarks.official_url,
          landmarks.source_url,
          landmarks.tags_json,
          landmarks.first_seen_at,
          landmarks.last_seen_at,
          landmark_unlocks.session_id,
          landmark_unlocks.unlocked_at,
          landmark_unlocks.unlock_distance_meters,
          landmark_unlocks.gps_accuracy_meters,
          landmark_unlocks.reward_xp,
          landmark_unlocks.reward_coins,
          landmark_unlocks.reward_sakura_shards,
          exploration_sessions.started_at
            AS session_started_at,
          exploration_sessions.distance_meters
            AS session_distance_meters,
          exploration_sessions.duration_seconds
            AS session_duration_seconds
        FROM landmark_unlocks
        INNER JOIN landmarks
          ON landmarks.id = landmark_unlocks.landmark_id
        LEFT JOIN exploration_sessions
          ON exploration_sessions.id =
            landmark_unlocks.session_id
        ORDER BY landmark_unlocks.unlocked_at DESC
      `,
    );

  return rows.map(mapUnlockedLandmarkRow);
}

export async function getUnlockedLandmark(
  database: SQLiteDatabase,
  landmarkId: string,
): Promise<UnlockedLandmarkSummary | null> {
  await ensureLandmarkDatabase(database);

  const row =
    await database.getFirstAsync<UnlockedLandmarkRow>(
      `
        SELECT
          landmarks.id,
          landmarks.source_type,
          landmarks.source_id,
          landmarks.name,
          landmarks.latitude,
          landmarks.longitude,
          landmarks.category,
          landmarks.importance_score,
          landmarks.importance_tier,
          landmarks.eligible,
          landmarks.wikidata_id,
          landmarks.wikipedia_tag,
          landmarks.official_url,
          landmarks.source_url,
          landmarks.tags_json,
          landmarks.first_seen_at,
          landmarks.last_seen_at,
          landmark_unlocks.session_id,
          landmark_unlocks.unlocked_at,
          landmark_unlocks.unlock_distance_meters,
          landmark_unlocks.gps_accuracy_meters,
          landmark_unlocks.reward_xp,
          landmark_unlocks.reward_coins,
          landmark_unlocks.reward_sakura_shards,
          exploration_sessions.started_at
            AS session_started_at,
          exploration_sessions.distance_meters
            AS session_distance_meters,
          exploration_sessions.duration_seconds
            AS session_duration_seconds
        FROM landmark_unlocks
        INNER JOIN landmarks
          ON landmarks.id = landmark_unlocks.landmark_id
        LEFT JOIN exploration_sessions
          ON exploration_sessions.id =
            landmark_unlocks.session_id
        WHERE landmarks.id = ?
        LIMIT 1
      `,
      landmarkId,
    );

  return row ? mapUnlockedLandmarkRow(row) : null;
}

export async function getLandmarkContentCache(
  database: SQLiteDatabase,
  landmarkId: string,
  language: string,
): Promise<LandmarkContentCache | null> {
  await ensureLandmarkDatabase(database);

  const row =
    await database.getFirstAsync<LandmarkContentRow>(
      `
        SELECT
          landmark_id,
          language,
          source_language,
          title,
          summary,
          image_url,
          wikipedia_url,
          wikidata_description,
          fetched_at
        FROM landmark_content_cache
        WHERE landmark_id = ?
          AND language = ?
        LIMIT 1
      `,
      landmarkId,
      language,
    );

  if (!row) {
    return null;
  }

  return {
    fetchedAt: row.fetched_at,
    imageUrl: row.image_url,
    language: row.language,
    landmarkId: row.landmark_id,
    sourceLanguage: row.source_language,
    summary: row.summary,
    title: row.title,
    wikipediaUrl: row.wikipedia_url,
    wikidataDescription: row.wikidata_description,
  };
}

export async function saveLandmarkContentCache(
  database: SQLiteDatabase,
  content: LandmarkContentCache,
): Promise<void> {
  await ensureLandmarkDatabase(database);

  await database.runAsync(
    `
      INSERT INTO landmark_content_cache (
        landmark_id,
        language,
        source_language,
        title,
        summary,
        image_url,
        wikipedia_url,
        wikidata_description,
        fetched_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(landmark_id, language)
      DO UPDATE SET
        source_language = excluded.source_language,
        title = excluded.title,
        summary = excluded.summary,
        image_url = excluded.image_url,
        wikipedia_url = excluded.wikipedia_url,
        wikidata_description =
          excluded.wikidata_description,
        fetched_at = excluded.fetched_at
    `,
    content.landmarkId,
    content.language,
    content.sourceLanguage,
    content.title,
    content.summary,
    content.imageUrl,
    content.wikipediaUrl,
    content.wikidataDescription,
    content.fetchedAt,
  );
}

function mapUnlockedLandmarkRow(
  row: UnlockedLandmarkRow,
): UnlockedLandmarkSummary {
  return {
    ...mapLandmarkRow(row),
    discovery: {
      gpsAccuracyMeters: row.gps_accuracy_meters,
      reward: {
        coins: row.reward_coins,
        sakuraShards: row.reward_sakura_shards,
        xp: row.reward_xp,
      },
      sessionDistanceMeters:
        row.session_distance_meters,
      sessionDurationSeconds:
        row.session_duration_seconds,
      sessionId: row.session_id,
      sessionStartedAt: row.session_started_at,
      unlockDistanceMeters:
        row.unlock_distance_meters,
      unlockedAt: row.unlocked_at,
    },
  };
}

function mapLandmarkRow(
  row: LandmarkRow,
): LandmarkRecord {
  let tags: Record<string, string> = {};

  try {
    tags = JSON.parse(row.tags_json) as Record<string, string>;
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

async function ensureColumn(
  database: SQLiteDatabase,
  table: string,
  column: string,
  definition: string,
): Promise<void> {
  const rows = await database.getAllAsync<{ name: string }>(
    `PRAGMA table_info(${table})`,
  );

  if (rows.some((row) => row.name === column)) {
    return;
  }

  await database.execAsync(
    `ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`,
  );
}
