import { describe, expect, it } from "vitest";

import { buildApp } from "../src/app";
import { createInMemoryRepositories } from "../src/db/client";
import { hashPassword } from "../src/services/password";
import { buildAuthedTestApp } from "./test-app";

describe("plans routes", () => {
  it("imports plan URLs line by line", async () => {
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
      url: "/api/plans/import",
      payload: { text: "https://learn.microsoft.com/en-us/training/paths/example/" },
      cookies: sessionCookie ? { autolearn_session: sessionCookie.value } : {},
    });

    expect(response.statusCode).toBe(200);
  });

  it("clears imported plans", async () => {
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
      plans: [
        {
          id: 1,
          url: "https://learn.microsoft.com/en-us/training/paths/example-1",
          position: 0,
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
      url: "/api/plans",
      cookies: sessionCookie ? { autolearn_session: sessionCookie.value } : {},
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().plans).toEqual([]);
  });

  it("rejects empty plan import payloads instead of clearing the plan pool", async () => {
    const { app, cookies, repositories } = await buildAuthedTestApp({
      plans: [
        {
          id: 1,
          url: "https://learn.microsoft.com/en-us/training/paths/example-1",
          position: 0,
          enabled: true,
        },
      ],
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/plans/import",
      payload: {},
      cookies,
    });

    expect(response.statusCode).toBe(400);
    expect(await repositories.listPlans()).toEqual([
      expect.objectContaining({
        id: 1,
        url: "https://learn.microsoft.com/en-us/training/paths/example-1",
      }),
    ]);
  });
});
