import { beforeEach, describe, expect, it } from "vitest";

import { buildApp } from "../src/app";
import { createInMemoryRepositories } from "../src/db/client";
import { hashPassword } from "../src/services/password";

describe("auth routes", () => {
  beforeEach(async () => {
    process.env.SESSION_SECRET = "01234567890123456789012345678901";
    process.env.DATABASE_URL = "postgres://postgres:postgres@localhost:5432/autolearn_test";
  });

  it("rejects login with unknown admin", async () => {
    const app = await buildApp({ repositories: createInMemoryRepositories() });
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { username: "admin", password: "bad-password" },
    });
    expect(response.statusCode).toBe(401);
  });

  it("reports unauthenticated when the session cookie is missing", async () => {
    const app = await buildApp({ repositories: createInMemoryRepositories() });
    const response = await app.inject({
      method: "GET",
      url: "/api/auth/session",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true, authenticated: false });
  });

  it("reports authenticated after a successful login", async () => {
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
      method: "GET",
      url: "/api/auth/session",
      cookies: sessionCookie ? { autolearn_session: sessionCookie.value } : {},
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true, authenticated: true });
  });
});
