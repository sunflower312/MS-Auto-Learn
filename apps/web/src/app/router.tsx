import { Suspense, lazy } from "react";
import { Navigate, RouterProvider, createBrowserRouter, createMemoryRouter } from "react-router-dom";

import { ConsoleShell } from "../features/layout/console-shell";
import { RouteLoadingState } from "../features/layout/route-loading-state";
import { LoginRoute } from "../routes/login";

const DashboardRoute = lazy(async () => ({
  default: (await import("../routes/dashboard")).DashboardRoute,
}));
const AccountsRoute = lazy(async () => ({
  default: (await import("../routes/accounts")).AccountsRoute,
}));
const PlansRoute = lazy(async () => ({
  default: (await import("../routes/plans")).PlansRoute,
}));

type AppRouterProps = {
  initialPath?: string;
  isAuthenticated: boolean;
  onLogout?: () => Promise<void> | void;
};

function ProtectedLayout({
  isAuthenticated,
  onLogout,
}: {
  isAuthenticated: boolean;
  onLogout?: () => Promise<void> | void;
}) {
  if (!isAuthenticated) {
    return <LoginRoute />;
  }

  return <ConsoleShell onLogout={onLogout} />;
}

function createRoutes(isAuthenticated: boolean, onLogout?: () => Promise<void> | void) {
  function withRouteFallback(element: React.ReactNode) {
    return <Suspense fallback={<RouteLoadingState />}>{element}</Suspense>;
  }

  return [
    {
      path: "/login",
      element: <LoginRoute />,
    },
    {
      path: "/",
      element: <ProtectedLayout isAuthenticated={isAuthenticated} onLogout={onLogout} />,
      children: [
        {
          index: true,
          element: <Navigate to="/dashboard" replace />,
        },
        {
          path: "dashboard",
          element: withRouteFallback(<DashboardRoute />),
        },
        {
          path: "accounts",
          element: withRouteFallback(<AccountsRoute />),
        },
        {
          path: "plans",
          element: withRouteFallback(<PlansRoute />),
        },
      ],
    },
    {
      path: "*",
      element: <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />,
    },
  ];
}

export function AppRouter({ initialPath, isAuthenticated, onLogout }: AppRouterProps) {
  const routes = createRoutes(isAuthenticated, onLogout);
  const router =
    typeof initialPath === "string"
      ? createMemoryRouter(routes, {
          initialEntries: [initialPath],
        })
      : createBrowserRouter(routes);

  return <RouterProvider router={router} />;
}
