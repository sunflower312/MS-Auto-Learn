type QueryResult<TRow> = {
  rows: TRow[];
};

type Queryable = {
  query<TRow>(text: string, values?: unknown[]): Promise<QueryResult<TRow>>;
};

export const REQUIRED_SCHEMA_TABLES = [
  "schema_migrations",
  "admin_users",
  "accounts",
  "plans",
] as const;

export const REQUIRED_SCHEMA_COLUMNS: Record<string, string[]> = {
  schema_migrations: ["filename"],
  admin_users: ["id", "username", "password_hash", "created_at", "updated_at"],
  accounts: ["id", "email", "encrypted_password", "enabled", "created_at", "updated_at"],
  plans: ["id", "url", "position", "enabled", "created_at", "updated_at"],
};

export async function assertDatabaseSchema(queryable: Queryable): Promise<void> {
  const tableResult = await queryable.query<{ tableName: string }>(
    `
      SELECT table_name AS "tableName"
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `,
  );
  const existingTables = new Set(tableResult.rows.map((row) => row.tableName));
  const missingTables = REQUIRED_SCHEMA_TABLES.filter((tableName) => !existingTables.has(tableName));

  const columnResult = await queryable.query<{ tableName: string; columnName: string }>(
    `
      SELECT table_name AS "tableName", column_name AS "columnName"
      FROM information_schema.columns
      WHERE table_schema = 'public'
    `,
  );
  const columnsByTable = new Map<string, Set<string>>();
  for (const row of columnResult.rows) {
    const existingColumns = columnsByTable.get(row.tableName) ?? new Set<string>();
    existingColumns.add(row.columnName);
    columnsByTable.set(row.tableName, existingColumns);
  }

  const missingColumns = Object.entries(REQUIRED_SCHEMA_COLUMNS).flatMap(([tableName, columns]) =>
    columns
      .filter((columnName) => !(columnsByTable.get(tableName)?.has(columnName) ?? false))
      .map((columnName) => `${tableName}.${columnName}`),
  );

  if (missingTables.length === 0 && missingColumns.length === 0) {
    return;
  }

  const missingParts = [
    ...missingTables.map((tableName) => `table:${tableName}`),
    ...missingColumns.map((columnName) => `column:${columnName}`),
  ];
  throw new Error(
    `Database schema is missing or incomplete. Run database migrations first. Missing ${missingParts.join(", ")}`,
  );
}
