import type { LucideIcon } from "lucide-react";
import { BookCopy, LayoutDashboard, UserSquare2 } from "lucide-react";

export type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const navigationItems: NavigationItem[] = [
  {
    href: "/dashboard",
    label: "概览",
    icon: LayoutDashboard,
  },
  {
    href: "/accounts",
    label: "账号池",
    icon: UserSquare2,
  },
  {
    href: "/plans",
    label: "计划池",
    icon: BookCopy,
  },
];

export function resolveNavigationItem(pathname: string) {
  return (
    navigationItems.find((item) =>
      item.href === "/dashboard" ? pathname === "/" || pathname.startsWith(item.href) : pathname.startsWith(item.href),
    ) ?? navigationItems[0]
  );
}
