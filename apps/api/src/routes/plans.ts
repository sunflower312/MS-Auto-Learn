import type { FastifyPluginAsync } from "fastify";
import { planImportSchema } from "@autolearn/contracts";

function parsePlanLines(text: string): string[] {
  const seen = new Set<string>();
  const items: string[] = [];

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    const key = line.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    items.push(line);
  }

  return items;
}

export const planRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/plans", { preHandler: app.requireAdmin }, async () => {
    return { ok: true, plans: await app.repositories.listPlans() };
  });

  app.post("/api/plans/import", { preHandler: app.requireAdmin }, async (request, reply) => {
    const payload = planImportSchema.safeParse(request.body);
    if (!payload.success) {
      return reply.code(400).send({ ok: false, error: "INVALID_PLAN_IMPORT_INPUT" });
    }

    await app.repositories.replacePlans(parsePlanLines(payload.data.text));
    return { ok: true, plans: await app.repositories.listPlans() };
  });

  app.delete("/api/plans", { preHandler: app.requireAdmin }, async () => {
    await app.repositories.clearPlans();
    return { ok: true, plans: await app.repositories.listPlans() };
  });
};
