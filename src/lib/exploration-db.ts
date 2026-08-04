import type { SQLiteDatabase } from "expo-sqlite";

import type { SessionPoint } from "@/lib/session-tracking";

type ExploredCellRow = {
  cell_id: string;
};

type CountRow = {
  count: number;
};

type SettingRow = {
  value: string;
};

type SessionRow = {
  accepted_points: number;
  discovered_cells: number;
  distance_meters: number;
  duration_seconds: number;
  ended_at: string | null;
  id: string;
  rejected_points: number;
  started_at: string;
  status: ExplorationSessionStatus;
};

type SessionPointRow = {
  accuracy: number;
  altitude: number | null;
  heading: number | null;
  latitude: number;
  longitude: number;
  sequence: number;
  speed: number | null;
  timestamp_ms: number;
};

export type ExplorationSessionStatus =
  | "active"
  | "completed"
  | "interrupted";

export type ExplorationSessionSummary = {
  acceptedPoints: number;
  discoveredCells: number;
  distanceMeters: number;
  durationSeconds: number;
  endedAt: string | null;
  id: string;
  rejectedPoints: number;
  startedAt: string;
  status: ExplorationSessionStatus;
};

export type ExplorationSessionDetails =
  ExplorationSessionSummary & {
    points: SessionPoint[];
  };

export async function migrateExplorationDatabase(
  database: SQLiteDatabase,
): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS explored_cells (
      cell_id TEXT PRIMARY KEY NOT NULL,
      resolution INTEGER NOT NULL,
      first_discovered_at TEXT NOT NULL,
      last_visited_at TEXT NOT NULL,
      visit_count INTEGER NOT NULL DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS idx_explored_cells_resolution
      ON explored_cells (resolution);

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS exploration_sessions (
      id TEXT PRIMARY KEY NOT NULL,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      distance_meters REAL NOT NULL DEFAULT 0,
      duration_seconds INTEGER NOT NULL DEFAULT 0,
      discovered_cells INTEGER NOT NULL DEFAULT 0,
      accepted_points INTEGER NOT NULL DEFAULT 0,
      rejected_points INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'completed', 'interrupted'))
    );

    CREATE INDEX IF NOT EXISTS idx_exploration_sessions_started_at
      ON exploration_sessions (started_at DESC);

    CREATE INDEX IF NOT EXISTS idx_exploration_sessions_status
      ON exploration_sessions (status);

    CREATE TABLE IF NOT EXISTS exploration_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      sequence INTEGER NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      accuracy REAL NOT NULL,
      altitude REAL,
      speed REAL,
      heading REAL,
      timestamp_ms INTEGER NOT NULL,
      FOREIGN KEY (session_id)
        REFERENCES exploration_sessions (id)
        ON DELETE CASCADE,
      UNIQUE (session_id, sequence)
    );

    CREATE INDEX IF NOT EXISTS idx_exploration_points_session
      ON exploration_points (session_id, sequence);

    UPDATE exploration_sessions
    SET
      status = 'interrupted',
      ended_at = COALESCE(
        ended_at,
        strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      ),
      duration_seconds = MAX(
        duration_seconds,
        CAST(
          (
            julianday('now') -
            julianday(started_at)
          ) * 86400 AS INTEGER
        )
      )
    WHERE status = 'active';
  `);
}

export async function getAppSetting(
  database: SQLiteDatabase,
  key: string,
): Promise<string | null> {
  const row = await database.getFirstAsync<SettingRow>(
    "SELECT value FROM app_settings WHERE key = ? LIMIT 1",
    key,
  );

  return row?.value ?? null;
}

export async function setAppSetting(
  database: SQLiteDatabase,
  key: string,
  value: string,
): Promise<void> {
  await database.runAsync(
    `
      INSERT INTO app_settings (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
    `,
    key,
    value,
    new Date().toISOString(),
  );
}

export async function loadExploredCellIds(
  database: SQLiteDatabase,
): Promise<Set<string>> {
  const rows = await database.getAllAsync<ExploredCellRow>(
    "SELECT cell_id FROM explored_cells",
  );

  return new Set(rows.map((row) => row.cell_id));
}

export async function recordExploredCell(
  database: SQLiteDatabase,
  cellId: string,
  resolution: number,
): Promise<boolean> {
  const existing = await database.getFirstAsync<ExploredCellRow>(
    "SELECT cell_id FROM explored_cells WHERE cell_id = ? LIMIT 1",
    cellId,
  );

  const now = new Date().toISOString();

  await database.runAsync(
    `
      INSERT INTO explored_cells (
        cell_id,
        resolution,
        first_discovered_at,
        last_visited_at,
        visit_count
      )
      VALUES (?, ?, ?, ?, 1)
      ON CONFLICT(cell_id) DO UPDATE SET
        last_visited_at = excluded.last_visited_at,
        visit_count = explored_cells.visit_count + 1
    `,
    cellId,
    resolution,
    now,
    now,
  );

  return existing === null;
}

export async function countExploredCells(
  database: SQLiteDatabase,
): Promise<number> {
  const row = await database.getFirstAsync<CountRow>(
    "SELECT COUNT(*) AS count FROM explored_cells",
  );

  return row?.count ?? 0;
}

export async function clearExploredCells(
  database: SQLiteDatabase,
): Promise<void> {
  await database.runAsync("DELETE FROM explored_cells");
}

export async function createExplorationSession(
  database: SQLiteDatabase,
  id: string,
  startedAt: string,
): Promise<void> {
  await database.runAsync(
    `
      INSERT INTO exploration_sessions (
        id,
        started_at,
        status
      )
      VALUES (?, ?, 'active')
    `,
    id,
    startedAt,
  );
}

export async function insertExplorationPoint(
  database: SQLiteDatabase,
  sessionId: string,
  point: SessionPoint,
): Promise<void> {
  await database.runAsync(
    `
      INSERT INTO exploration_points (
        session_id,
        sequence,
        latitude,
        longitude,
        accuracy,
        altitude,
        speed,
        heading,
        timestamp_ms
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    sessionId,
    point.sequence,
    point.latitude,
    point.longitude,
    point.accuracy,
    point.altitude,
    point.speed,
    point.heading,
    point.timestamp,
  );
}

export async function updateExplorationSessionProgress(
  database: SQLiteDatabase,
  summary: ExplorationSessionSummary,
): Promise<void> {
  await database.runAsync(
    `
      UPDATE exploration_sessions
      SET
        distance_meters = ?,
        duration_seconds = ?,
        discovered_cells = ?,
        accepted_points = ?,
        rejected_points = ?
      WHERE id = ?
    `,
    summary.distanceMeters,
    summary.durationSeconds,
    summary.discoveredCells,
    summary.acceptedPoints,
    summary.rejectedPoints,
    summary.id,
  );
}

export async function completeExplorationSession(
  database: SQLiteDatabase,
  summary: ExplorationSessionSummary,
): Promise<void> {
  await database.runAsync(
    `
      UPDATE exploration_sessions
      SET
        ended_at = ?,
        distance_meters = ?,
        duration_seconds = ?,
        discovered_cells = ?,
        accepted_points = ?,
        rejected_points = ?,
        status = ?
      WHERE id = ?
    `,
    summary.endedAt,
    summary.distanceMeters,
    summary.durationSeconds,
    summary.discoveredCells,
    summary.acceptedPoints,
    summary.rejectedPoints,
    summary.status,
    summary.id,
  );
}

export async function listExplorationSessions(
  database: SQLiteDatabase,
  limit = 100,
): Promise<ExplorationSessionSummary[]> {
  const rows = await database.getAllAsync<SessionRow>(
    `
      SELECT
        id,
        started_at,
        ended_at,
        distance_meters,
        duration_seconds,
        discovered_cells,
        accepted_points,
        rejected_points,
        status
      FROM exploration_sessions
      WHERE status != 'active'
      ORDER BY started_at DESC
      LIMIT ?
    `,
    limit,
  );

  return rows.map(mapSessionRow);
}

export async function getExplorationSessionDetails(
  database: SQLiteDatabase,
  id: string,
): Promise<ExplorationSessionDetails | null> {
  const session = await database.getFirstAsync<SessionRow>(
    `
      SELECT
        id,
        started_at,
        ended_at,
        distance_meters,
        duration_seconds,
        discovered_cells,
        accepted_points,
        rejected_points,
        status
      FROM exploration_sessions
      WHERE id = ?
      LIMIT 1
    `,
    id,
  );

  if (!session) {
    return null;
  }

  const pointRows = await database.getAllAsync<SessionPointRow>(
    `
      SELECT
        sequence,
        latitude,
        longitude,
        accuracy,
        altitude,
        speed,
        heading,
        timestamp_ms
      FROM exploration_points
      WHERE session_id = ?
      ORDER BY sequence ASC
    `,
    id,
  );

  return {
    ...mapSessionRow(session),
    points: pointRows.map((row) => ({
      accuracy: row.accuracy,
      altitude: row.altitude,
      heading: row.heading,
      latitude: row.latitude,
      longitude: row.longitude,
      sequence: row.sequence,
      speed: row.speed,
      timestamp: row.timestamp_ms,
    })),
  };
}

function mapSessionRow(
  row: SessionRow,
): ExplorationSessionSummary {
  return {
    acceptedPoints: row.accepted_points,
    discoveredCells: row.discovered_cells,
    distanceMeters: row.distance_meters,
    durationSeconds: row.duration_seconds,
    endedAt: row.ended_at,
    id: row.id,
    rejectedPoints: row.rejected_points,
    startedAt: row.started_at,
    status: row.status,
  };
}
