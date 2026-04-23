import { newDb } from "pg-mem";
import { describe, expect, it } from "vitest";

import { runDatabaseMigrations } from "../src/db/migrations/runner";
import { createPostgresRepositories } from "../src/db/postgres";
import { createAdminUser } from "../src/services/admin-users";

describe("admin users service", () => {
  it("hashes and persists admin credentials", async () => {
    const database = newDb({ noAstCoverageCheck: true });
    const adapter = database.adapters.createPg();
    const pool = new adapter.Pool();
    await runDatabaseMigrations(pool);
    const repositories = await createPostgresRepositories({ pool });

    const admin = await createAdminUser(repositories, {
      username: "admin",
      password: "secret123",
    });
    const stored = await repositories.findAdminByUsername("admin");

    expect(admin.username).toBe("admin");
    expect(stored?.passwordHash).toBeTruthy();
    expect(stored?.passwordHash).not.toBe("secret123");

    await pool.end();
  });
});
