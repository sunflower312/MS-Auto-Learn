import { describe, expect, it } from "vitest";

import { buildApp } from "../src/app";
import { createInMemoryRepositories } from "../src/db/client";
import { hashPassword } from "../src/services/password";
import { buildAuthedTestApp } from "./test-app";

describe("accounts routes", () => {
  it("imports email-password pairs", async () => {
    process.env.SESSION_SECRET = "01234567890123456789012345678901";
    process.env.DATABASE_URL = "postgres://postgres:postgres@localhost:5432/autolearn_test";

    const repositories = createInMemoryRepositories({
      admins: [
        {
          id: 1,
          username: "admin",
          passwordHash: await hashPassword("secret123"),
        },
      ],
    });

    const app = await buildApp({ repositories });
    const login = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { username: "admin", password: "secret123" },
    });

    const sessionCookie = login.cookies.find((cookie) => cookie.name === "autolearn_session");

    const response = await app.inject({
      method: "POST",
      url: "/api/accounts/import",
      payload: { text: "user@example.com----secret123" },
      cookies: sessionCookie ? { autolearn_session: sessionCookie.value } : {},
    });

    expect(response.statusCode).toBe(200);
  });

  it("clears imported accounts", async () => {
    process.env.SESSION_SECRET = "01234567890123456789012345678901";
    process.env.DATABASE_URL = "postgres://postgres:postgres@localhost:5432/autolearn_test";

    const repositories = createInMemoryRepositories({
      admins: [
        {
          id: 1,
          username: "admin",
          passwordHash: await hashPassword("secret123"),
        },
      ],
      accounts: [
        {
          id: 1,
          email: "user@example.com",
          encryptedPassword: "secret123",
          enabled: true,
        },
      ],
    });

    const app = await buildApp({ repositories });
    const login = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { username: "admin", password: "secret123" },
    });

    const sessionCookie = login.cookies.find((cookie) => cookie.name === "autolearn_session");

    const response = await app.inject({
      method: "DELETE",
      url: "/api/accounts",
      cookies: sessionCookie ? { autolearn_session: sessionCookie.value } : {},
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().accounts).toEqual([]);
  });

  it("rejects empty account import payloads", async () => {
    const { app, cookies, repositories } = await buildAuthedTestApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/accounts/import",
      payload: {},
      cookies,
    });

    expect(response.statusCode).toBe(400);
    expect(await repositories.listAccounts()).toEqual([]);
  });
});
