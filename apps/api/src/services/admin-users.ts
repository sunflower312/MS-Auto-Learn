import type { AppRepositories } from "../db/client";

import { hashPassword } from "./password";

export async function createAdminUser(
  repositories: AppRepositories,
  input: { username: string; password: string },
) {
  const passwordHash = await hashPassword(input.password);
  return repositories.upsertAdmin({
    username: input.username,
    passwordHash,
  });
}
