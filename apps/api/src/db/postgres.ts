import { Pool } from "pg";

import { assertDatabaseSchema } from "./schema-check";

import type {
  AccountRecord,
  AdminUserRecord,
  AppRepositories,
  PlanRecord,
} from "./client";

type QueryResult<TRow> = {
  rows: TRow[];
};

type Queryable = {
  query<TRow>(text: string, values?: unknown[]): Promise<QueryResult<TRow>>;
};

type CreatePostgresRepositoriesOptions = {
  connectionString?: string;
  pool?: Queryable;
};

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function createRepositoriesFromQueryable(queryable: Queryable): AppRepositories {
  return {
    async findAdminByUsername(username) {
      const result = await queryable.query<AdminUserRecord>(
        `SELECT
           id,
           username,
           password_hash AS "passwordHash"
         FROM admin_users
         WHERE username = $1
         LIMIT 1`,
        [normalizeUsername(username)],
      );

      return result.rows[0];
    },
    async upsertAdmin(admin) {
      const result = await queryable.query<AdminUserRecord>(
        `INSERT INTO admin_users (username, password_hash)
         VALUES ($1, $2)
         ON CONFLICT (username)
         DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = NOW()
         RETURNING
           id,
           username,
           password_hash AS "passwordHash"`,
        [normalizeUsername(admin.username), admin.passwordHash],
      );

      return result.rows[0] as AdminUserRecord;
    },
    async listAccounts() {
      const result = await queryable.query<AccountRecord>(
        `SELECT
           id,
           email,
           encrypted_password AS "encryptedPassword",
           enabled
         FROM accounts
         ORDER BY id ASC`,
      );

      return result.rows;
    },
    async upsertAccounts(records) {
      for (const record of records) {
        await queryable.query(
          `INSERT INTO accounts (email, encrypted_password, enabled)
           VALUES ($1, $2, TRUE)
           ON CONFLICT (email)
           DO UPDATE SET
             encrypted_password = EXCLUDED.encrypted_password,
             enabled = TRUE,
             updated_at = NOW()`,
          [normalizeEmail(record.email), record.password],
        );
      }
    },
    async clearAccounts() {
      await queryable.query("DELETE FROM accounts");
    },
    async listPlans() {
      const result = await queryable.query<PlanRecord>(
        `SELECT
           id,
           url,
           position,
           enabled
         FROM plans
         ORDER BY position ASC`,
      );

      return result.rows;
    },
    async replacePlans(urls) {
      await queryable.query("DELETE FROM plans");
      for (const [index, url] of urls.entries()) {
        await queryable.query(
          `INSERT INTO plans (url, position, enabled)
           VALUES ($1, $2, TRUE)`,
          [url.trim(), index],
        );
      }
    },
    async clearPlans() {
      await queryable.query("DELETE FROM plans");
    },
  };
}

export async function createPostgresRepositories(
  options: CreatePostgresRepositoriesOptions,
): Promise<AppRepositories> {
  const queryable =
    options.pool ??
    new Pool({
      connectionString: options.connectionString,
    });

  await assertDatabaseSchema(queryable);
  return createRepositoriesFromQueryable(queryable);
}

export async function createPostgresRepositoryHandle(connectionString: string): Promise<{
  repositories: AppRepositories;
  close(): Promise<void>;
}> {
  const pool = new Pool({
    connectionString,
  });

  const repositories = await createPostgresRepositories({ pool });
  return {
    repositories,
    async close() {
      await pool.end();
    },
  };
}
