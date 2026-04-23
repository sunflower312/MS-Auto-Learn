import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  assertDatabaseSchema,
  REQUIRED_SCHEMA_COLUMNS,
  REQUIRED_SCHEMA_TABLES,
} from "../src/db/schema-check";

type QueryCall = {
  text: string;
};

function createQueryable(columns: Array<{ tableName: string; columnName: string }>) {
  const calls: QueryCall[] = [];

  return {
    calls,
    async query<TRow>(text: string) {
      calls.push({ text });
      if (text.includes("information_schema.tables")) {
        const tableNames = [...new Set(columns.map((column) => column.tableName))];
        return {
          rows: tableNames.map((tableName) => ({ tableName })) as TRow[],
        };
      }

      return {
        rows: columns as TRow[],
      };
    },
  };
}

function buildSchemaColumns() {
  return [
    { tableName: "schema_migrations", columnName: "filename" },
    { tableName: "admin_users", columnName: "id" },
    { tableName: "admin_users", columnName: "username" },
    { tableName: "admin_users", columnName: "password_hash" },
    { tableName: "admin_users", columnName: "created_at" },
    { tableName: "admin_users", columnName: "updated_at" },
    { tableName: "accounts", columnName: "id" },
    { tableName: "accounts", columnName: "email" },
    { tableName: "accounts", columnName: "encrypted_password" },
    { tableName: "accounts", columnName: "enabled" },
    { tableName: "accounts", columnName: "created_at" },
    { tableName: "accounts", columnName: "updated_at" },
    { tableName: "plans", columnName: "id" },
    { tableName: "plans", columnName: "url" },
    { tableName: "plans", columnName: "position" },
    { tableName: "plans", columnName: "enabled" },
    { tableName: "plans", columnName: "created_at" },
    { tableName: "plans", columnName: "updated_at" },
  ];
}

function parseMigrationSchema() {
  const sql = readFileSync(
    resolve(process.cwd(), "src/db/migrations/0001_initial_schema.sql"),
    "utf8",
  );
  const tablePattern = /CREATE TABLE IF NOT EXISTS (\w+) \(([\s\S]*?)\);/g;
  const tables: string[] = [];
  const columns: Record<string, string[]> = {};

  for (const match of sql.matchAll(tablePattern)) {
    const tableName = match[1];
    const body = match[2] ?? "";
    if (!tableName) {
      continue;
    }
    tables.push(tableName);
    columns[tableName] = body
      .split("\n")
      .map((line) => line.trim().replace(/,$/, ""))
      .filter(Boolean)
      .map((line) => line.split(/\s+/, 2)[0] ?? "")
      .filter((name) => !["PRIMARY", "FOREIGN", "UNIQUE", "CHECK", "CONSTRAINT"].includes(name));
  }

  return { tables, columns };
}

describe("assertDatabaseSchema", () => {
  it("fails when a required schema column is missing", async () => {
    const queryable = createQueryable(
      buildSchemaColumns().filter(
        (column) => !(column.tableName === "accounts" && column.columnName === "created_at"),
      ),
    );

    await expect(assertDatabaseSchema(queryable)).rejects.toThrow(/accounts\.created_at/i);
  });

  it("accepts the current non-runtime schema", async () => {
    const queryable = createQueryable(buildSchemaColumns());

    await expect(assertDatabaseSchema(queryable)).resolves.toBeUndefined();
    expect(queryable.calls).toHaveLength(2);
  });

  it("stays aligned with the current migration schema", () => {
    const schema = parseMigrationSchema();
    const expectedTables = ["schema_migrations", ...schema.tables];
    const expectedColumns = {
      schema_migrations: ["filename"],
      ...schema.columns,
    };

    expect([...REQUIRED_SCHEMA_TABLES]).toEqual(expectedTables);
    expect(REQUIRED_SCHEMA_COLUMNS).toEqual(expectedColumns);
  });
});
