import { useEffect, useState } from "react";

import { getJson, postJson } from "../lib/api";
import { AppRouter } from "./router";

type SessionPayload = {
  authenticated: boolean;
};

type RootAppProps = {
  initialPath?: string;
  loadSession?: () => Promise<SessionPayload>;
};

type BootstrapState =
  | {
      status: "loading";
    }
  | {
      status: "ready";
      isAuthenticated: boolean;
    };

async function defaultLoadSession() {
  return getJson<SessionPayload>("/api/auth/session");
}

export function RootApp({ initialPath, loadSession = defaultLoadSession }: RootAppProps) {
  const [bootstrapState, setBootstrapState] = useState<BootstrapState>({
    status: "loading",
  });

  async function handleLogout() {
    try {
      await postJson("/api/auth/logout", {});
    } finally {
      setBootstrapState({
        status: "ready",
        isAuthenticated: false,
      });
    }
  }

  useEffect(() => {
    let isActive = true;

    async function bootstrapSession() {
      try {
        const session = await loadSession();
        if (!isActive) {
          return;
        }

        setBootstrapState({
          status: "ready",
          isAuthenticated: session.authenticated,
        });
      } catch {
        if (!isActive) {
          return;
        }

        setBootstrapState({
          status: "ready",
          isAuthenticated: false,
        });
      }
    }

    void bootstrapSession();

    return () => {
      isActive = false;
    };
  }, [loadSession]);

  if (bootstrapState.status === "loading") {
    return (
      <div className="boot-screen bg-transparent px-6">
        <div className="grid max-w-md justify-items-center gap-3 rounded-[1.75rem] border border-cyan-100/70 bg-white/80 px-8 py-10 text-center shadow-[0_20px_45px_rgba(8,145,178,0.08)] backdrop-blur-xl">
          <p className="shell-eyebrow">Microsoft Auto Learn</p>
          <h1 className="shell-title">加载控制台</h1>
          <p className="shell-description">正在读取管理员会话与控制台状态。</p>
        </div>
      </div>
    );
  }

  return (
    <AppRouter
      initialPath={initialPath}
      isAuthenticated={bootstrapState.isAuthenticated}
      onLogout={handleLogout}
    />
  );
}
