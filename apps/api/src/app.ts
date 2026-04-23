import Fastify, { type FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import secureSession from "@fastify/secure-session";

import type { AppRepositories } from "./db/client";
import { createPostgresRepositoryHandle } from "./db/postgres";
import { loadEnv } from "./env";
import { authPlugin } from "./plugins/auth";
import { accountRoutes } from "./routes/accounts";
import { authRoutes } from "./routes/auth";
import { healthRoutes } from "./routes/health";
import { planRoutes } from "./routes/plans";
import { hashPassword, verifyPassword } from "./services/password";
import { SESSION_COOKIE } from "./services/sessions";

type BuildAppOptions = {
  repositories?: AppRepositories;
};

export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const env = loadEnv();
  const app = Fastify();
  let closeRepositories: (() => Promise<void>) | undefined;

  await app.register(cookie);
  await app.register(secureSession, {
    key: Buffer.from(env.SESSION_SECRET.slice(0, 32), "utf8"),
    cookieName: SESSION_COOKIE,
    cookie: {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    },
  });

  if (options.repositories) {
    app.decorate("repositories", options.repositories);
  } else {
    const repositoryHandle = await createPostgresRepositoryHandle(env.DATABASE_URL);
    closeRepositories = repositoryHandle.close;
    app.decorate("repositories", repositoryHandle.repositories);
  }
  app.decorate("password", {
    hash: hashPassword,
    verify: verifyPassword,
  });

  if (closeRepositories) {
    app.addHook("onClose", async () => {
      await closeRepositories?.();
    });
  }

  await app.register(authPlugin);
  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(accountRoutes);
  await app.register(planRoutes);

  return app;
}
