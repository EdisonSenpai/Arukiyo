import type { SQLiteDatabase } from "expo-sqlite";

type ExploredCellRow = {
  cell_id: string;
};

type CountRow = {
  count: number;
};

type SettingRow = {
  value: string;
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
