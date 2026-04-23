import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type QueryResult<TRow> = {
  rows: TRow[];
};

type Queryable = {
  query<TRow>(text: string, values?: unknown[]): Promise<QueryResult<TRow>>;
};

const MIGRATIONS_DIR = dirname(fileURLToPath(import.meta.url));

function listMigrationFiles() {
  return readdirSync(MIGRATIONS_DIR)
    .filter((filename) => /^\d+.*\.sql$/i.test(filename))
    .sort((left, right) => left.localeCompare(right));
}

function splitSqlStatements(sql: string) {
  return sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function ensureSchemaMigrationsTable(queryable: Queryable) {
  await queryable.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function listAppliedMigrations(queryable: Queryable) {
  const result = await queryable.query<{ filename: string }>(
    `SELECT filename FROM schema_migrations ORDER BY filename ASC`,
  );
  return new Set(result.rows.map((row) => row.filename));
}

export async function runDatabaseMigrations(queryable: Queryable): Promise<string[]> {
  await ensureSchemaMigrationsTable(queryable);

  const applied = await listAppliedMigrations(queryable);
  const newlyApplied: string[] = [];

  for (const filename of listMigrationFiles()) {
    if (applied.has(filename)) {
      continue;
    }

    const sql = readFileSync(join(MIGRATIONS_DIR, filename), "utf8");
    const statements = splitSqlStatements(sql);

    await queryable.query("BEGIN");
    try {
      for (const statement of statements) {
        await queryable.query(statement);
      }
      await queryable.query(`INSERT INTO schema_migrations (filename) VALUES ($1)`, [filename]);
      await queryable.query("COMMIT");
      newlyApplied.push(filename);
    } catch (error) {
      await queryable.query("ROLLBACK");
      throw error;
    }
  }

  return newlyApplied;
}
