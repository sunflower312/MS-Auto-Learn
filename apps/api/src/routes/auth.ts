import type { FastifyPluginAsync } from "fastify";
import { loginSchema } from "@autolearn/contracts";

import { SESSION_KEY } from "../services/sessions";

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/auth/session", async (request) => {
    const adminUserId = request.session.get(SESSION_KEY);
    return { ok: true, authenticated: Boolean(adminUserId) };
  });

  app.post("/api/auth/login", async (request, reply) => {
    const payload = loginSchema.parse(request.body);
    const admin = await app.repositories.findAdminByUsername(payload.username);
    if (!admin) {
      return reply.code(401).send({ ok: false, error: "INVALID_CREDENTIALS" });
    }

    const isValid = await app.password.verify(admin.passwordHash, payload.password);
    if (!isValid) {
      return reply.code(401).send({ ok: false, error: "INVALID_CREDENTIALS" });
    }

    request.session.set(SESSION_KEY, admin.id);
    return { ok: true, user: { id: admin.id, username: admin.username } };
  });

  app.post("/api/auth/logout", async (request) => {
    request.session.delete();
    return { ok: true };
  });
};
