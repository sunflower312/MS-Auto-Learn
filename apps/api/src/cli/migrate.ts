import { pathToFileURL } from "node:url";

import { Pool } from "pg";
import { z } from "zod";

import { runDatabaseMigrations as runMigrations } from "../db/migrations/runner";
import { assertDatabaseSchema } from "../db/schema-check";

const databaseEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
});

export async function runDatabaseMigrations(connectionString: string) {
  const pool = new Pool({
    connectionString,
  });

  try {
    const applied = await runMigrations(pool);
    await assertDatabaseSchema(pool);
    return applied;
  } finally {
    await pool.end();
  }
}

async function main() {
  const env = databaseEnvSchema.parse(process.env);
  const applied = await runDatabaseMigrations(env.DATABASE_URL);
  console.log(JSON.stringify({ ok: true, applied }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
