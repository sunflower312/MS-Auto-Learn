import { buildApp } from "../src/app";
import { createInMemoryRepositories, type AppRepositories } from "../src/db/client";
import { hashPassword } from "../src/services/password";

type InMemorySeed = Parameters<typeof createInMemoryRepositories>[0];

export async function buildAuthedTestApp(seed: InMemorySeed = {}): Promise<{
  app: Awaited<ReturnType<typeof buildApp>>;
  repositories: AppRepositories;
  cookies: Record<string, string>;
}> {
  process.env.SESSION_SECRET = "01234567890123456789012345678901";
  process.env.DATABASE_URL = "postgres://postgres:postgres@localhost:5432/autolearn_test";

  const repositories = createInMemoryRepositories({
    ...seed,
    admins: seed.admins ?? [
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
  if (!sessionCookie) {
    throw new Error("expected authenticated admin session cookie");
  }

  return {
    app,
    repositories,
    cookies: { autolearn_session: sessionCookie.value },
  };
}
