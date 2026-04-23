import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";

import { Button } from "../../components/ui/button";
import { cn } from "../../lib/cn";
import { navigationItems, resolveNavigationItem } from "./navigation";

type ConsoleShellProps = {
  onLogout?: () => Promise<void> | void;
};

export function ConsoleShell({ onLogout }: ConsoleShellProps) {
  const { pathname } = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const currentItem = resolveNavigationItem(pathname);

  async function handleLogout() {
    if (!onLogout) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await onLogout();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="border-b border-cyan-100/70 bg-white/78 px-5 py-6 backdrop-blur-xl lg:border-r lg:border-b-0 lg:px-5 lg:py-7">
        <div className="grid gap-2">
          <p className="shell-eyebrow">Microsoft Auto Learn</p>
          <h1 className="font-mono text-2xl font-semibold text-slate-950">控制台</h1>
          <p className="text-sm text-slate-500">在这里维护账号池、计划池，并承接后续运行域模块。</p>
        </div>

        <nav aria-label="Primary" className="mt-8">
          <ul className="grid gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    aria-label={item.label}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-[1rem] border border-transparent px-3 py-3 transition duration-200",
                        isActive
                          ? "border-cyan-200 bg-linear-to-r from-cyan-100 to-emerald-50 text-slate-950 shadow-sm"
                          : "bg-white/55 text-slate-700 hover:border-cyan-100 hover:bg-cyan-50",
                      )
                    }
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="text-sm font-semibold">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-8">
          <Button variant="secondary" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? "退出中..." : "退出登录"}
          </Button>
        </div>
      </aside>

      <main className="p-5 lg:p-7">
        <section className="mb-5 rounded-[1.25rem] border border-cyan-100/70 bg-white/72 px-5 py-4 shadow-[0_20px_45px_rgba(8,145,178,0.08)] backdrop-blur-xl">
          <p className="shell-eyebrow">Microsoft Auto Learn</p>
          <h2 className="mt-1 font-mono text-2xl font-semibold text-slate-950">{currentItem.label}</h2>
        </section>

        <Outlet />
      </main>
    </div>
  );
}
