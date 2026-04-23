import { pathToFileURL } from "node:url";

import type { AppRepositories } from "../db/client";
import { createPostgresRepositoryHandle } from "../db/postgres";
import { loadEnv } from "../env";
import { createAdminUser } from "../services/admin-users";

export async function runCreateAdmin(
  repositories: AppRepositories,
  input: { username: string; password: string },
) {
  return createAdminUser(repositories, input);
}

async function main(argv = process.argv.slice(2)) {
  const [username, password] = argv;

  if (!username || !password) {
    throw new Error("Usage: pnpm --filter @autolearn/api create-admin <username> <password>");
  }

  const env = loadEnv();
  const repositoryHandle = await createPostgresRepositoryHandle(env.DATABASE_URL);

  try {
    const admin = await runCreateAdmin(repositoryHandle.repositories, {
      username,
      password,
    });
    console.log(JSON.stringify(admin, null, 2));
  } finally {
    await repositoryHandle.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
