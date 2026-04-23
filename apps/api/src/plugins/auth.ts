import fp from "fastify-plugin";

import { SESSION_KEY } from "../services/sessions";

declare module "fastify" {
  interface FastifyInstance {
    repositories: import("../db/client").AppRepositories;
    password: {
      hash(password: string): Promise<string>;
      verify(hash: string, password: string): Promise<boolean>;
    };
    requireAdmin: import("fastify").preHandlerHookHandler;
  }
}

export const authPlugin = fp(async (app) => {
  app.decorate("requireAdmin", async (request, reply) => {
    const adminUserId = request.session.get(SESSION_KEY);
    if (!adminUserId) {
      return reply.code(401).send({ ok: false, error: "UNAUTHORIZED" });
    }
  });
});
