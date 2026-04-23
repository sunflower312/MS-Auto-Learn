import { describe, expect, it } from "vitest";

import { navigationItems, resolveNavigationItem } from "../features/layout/navigation";

describe("navigation", () => {
  it("exposes the current console sections", () => {
    expect(navigationItems.map((item) => item.href)).toEqual(["/dashboard", "/accounts", "/plans"]);
    expect(navigationItems.map((item) => item.label)).toEqual(["概览", "账号池", "计划池"]);
  });

  it("resolves dashboard as the default section", () => {
    expect(resolveNavigationItem("/")).toMatchObject({ href: "/dashboard", label: "概览" });
  });

  it("resolves section paths by prefix", () => {
    expect(resolveNavigationItem("/accounts/import")).toMatchObject({ href: "/accounts", label: "账号池" });
    expect(resolveNavigationItem("/plans/manage")).toMatchObject({ href: "/plans", label: "计划池" });
  });
});
