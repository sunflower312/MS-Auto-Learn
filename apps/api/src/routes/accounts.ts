import type { FastifyPluginAsync } from "fastify";
import { accountImportSchema } from "@autolearn/contracts";

function parseAccountLines(text: string): Array<{ email: string; password: string }> {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [email, password] = line.split("----", 2);
      return {
        email: email?.trim() ?? "",
        password: password?.trim() ?? "",
      };
    })
    .filter((record) => Boolean(record.email) && Boolean(record.password));
}

export const accountRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/accounts", { preHandler: app.requireAdmin }, async () => {
    return { ok: true, accounts: await app.repositories.listAccounts() };
  });

  app.post("/api/accounts/import", { preHandler: app.requireAdmin }, async (request, reply) => {
    const payload = accountImportSchema.safeParse(request.body);
    if (!payload.success) {
      return reply.code(400).send({ ok: false, error: "INVALID_ACCOUNT_IMPORT_INPUT" });
    }

    await app.repositories.upsertAccounts(parseAccountLines(payload.data.text));
    return { ok: true, accounts: await app.repositories.listAccounts() };
  });

  app.delete("/api/accounts", { preHandler: app.requireAdmin }, async () => {
    await app.repositories.clearAccounts();
    return { ok: true, accounts: await app.repositories.listAccounts() };
  });
};
