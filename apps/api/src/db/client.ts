export type AdminUserRecord = {
  id: number;
  username: string;
  passwordHash: string;
};

export type AccountRecord = {
  id: number;
  email: string;
  encryptedPassword: string;
  enabled: boolean;
};

export type PlanRecord = {
  id: number;
  url: string;
  position: number;
  enabled: boolean;
};

export type AppRepositories = {
  findAdminByUsername(username: string): Promise<AdminUserRecord | undefined>;
  upsertAdmin(admin: { username: string; passwordHash: string }): Promise<AdminUserRecord>;
  listAccounts(): Promise<AccountRecord[]>;
  upsertAccounts(records: Array<{ email: string; password: string }>): Promise<void>;
  clearAccounts(): Promise<void>;
  listPlans(): Promise<PlanRecord[]>;
  replacePlans(urls: string[]): Promise<void>;
  clearPlans(): Promise<void>;
};

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function createInMemoryRepositories(
  seed: {
    admins?: AdminUserRecord[];
    accounts?: AccountRecord[];
    plans?: PlanRecord[];
  } = {},
): AppRepositories {
  let nextAdminId = Math.max(0, ...(seed.admins ?? []).map((admin) => admin.id)) + 1;
  let nextAccountId = Math.max(0, ...(seed.accounts ?? []).map((account) => account.id)) + 1;
  let nextPlanId = Math.max(0, ...(seed.plans ?? []).map((plan) => plan.id)) + 1;

  const admins = new Map((seed.admins ?? []).map((admin) => [normalizeUsername(admin.username), admin]));
  const accounts = new Map((seed.accounts ?? []).map((account) => [normalizeEmail(account.email), account]));
  let plans = [...(seed.plans ?? [])];

  return {
    async findAdminByUsername(username) {
      return admins.get(normalizeUsername(username));
    },
    async upsertAdmin(admin) {
      const username = normalizeUsername(admin.username);
      const existing = admins.get(username);
      const nextAdmin: AdminUserRecord = {
        id: existing?.id ?? nextAdminId++,
        username,
        passwordHash: admin.passwordHash,
      };
      admins.set(username, nextAdmin);
      return nextAdmin;
    },
    async listAccounts() {
      return [...accounts.values()].sort((left, right) => left.id - right.id);
    },
    async upsertAccounts(records) {
      for (const record of records) {
        const email = normalizeEmail(record.email);
        const existing = accounts.get(email);
        accounts.set(email, {
          id: existing?.id ?? nextAccountId++,
          email,
          encryptedPassword: record.password,
          enabled: true,
        });
      }
    },
    async clearAccounts() {
      accounts.clear();
    },
    async listPlans() {
      return [...plans].sort((left, right) => left.position - right.position);
    },
    async replacePlans(urls) {
      plans = urls.map((url, index) => ({
        id: nextPlanId++,
        url: url.trim(),
        position: index,
        enabled: true,
      }));
    },
    async clearPlans() {
      plans = [];
    },
  };
}
