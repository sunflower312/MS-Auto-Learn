import { useEffect, useState } from "react";

import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { getJson } from "../../lib/api";

type AccountRecord = {
  id: number;
  email: string;
  enabled: boolean;
};

type PlanRecord = {
  id: number;
  url: string;
  position: number;
  enabled: boolean;
};

type OverviewState = {
  accounts: AccountRecord[];
  plans: PlanRecord[];
  status: "loading" | "ready" | "error";
  error: string;
};

function buildInitialState(): OverviewState {
  return {
    accounts: [],
    plans: [],
    status: "loading",
    error: "",
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "请求失败，请稍后再试。";
}

function StatCard({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <Card className="h-full">
      <CardContent className="gap-2 p-5">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <div className="font-mono text-3xl font-semibold text-slate-950">{value}</div>
        <p className="text-sm text-slate-500">{note}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardOverview() {
  const [state, setState] = useState<OverviewState>(buildInitialState);

  useEffect(() => {
    let isActive = true;

    async function loadOverview() {
      try {
        const [accountsResponse, plansResponse] = await Promise.all([
          getJson<{ accounts?: AccountRecord[] }>("/api/accounts"),
          getJson<{ plans?: PlanRecord[] }>("/api/plans"),
        ]);

        if (!isActive) {
          return;
        }

        setState({
          accounts: accountsResponse.accounts ?? [],
          plans: plansResponse.plans ?? [],
          status: "ready",
          error: "",
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setState({
          accounts: [],
          plans: [],
          status: "error",
          error: getErrorMessage(error),
        });
      }
    }

    void loadOverview();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="grid gap-6">
      {state.status === "error" ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-red-700">{state.error}</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="账号总数" value={state.accounts.length} note="账号池仍可正常维护。" />
        <StatCard label="计划总数" value={state.plans.length} note="计划池仍可正常维护。" />
        <Card className="h-full">
          <CardContent className="flex h-full flex-col justify-between gap-3 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-600">运行域状态</p>
              <Badge variant="neutral">待接入</Badge>
            </div>
            <p className="text-sm text-slate-500">
              运行域接口、调度能力与监控界面将在独立模块中接入。
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>当前账号池</CardTitle>
            <CardDescription>用于导入、查看和维护当前账号池。</CardDescription>
          </CardHeader>
          <CardContent>
            {state.status === "loading" ? (
              <p className="text-sm text-slate-600">正在读取账号池。</p>
            ) : state.accounts.length === 0 ? (
              <p className="text-sm text-slate-600">暂无账号。</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>邮箱</TableHead>
                    <TableHead>启用</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium text-slate-950">{account.email}</TableCell>
                      <TableCell>{account.enabled ? "是" : "否"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>当前计划池</CardTitle>
            <CardDescription>用于维护待执行的计划列表。</CardDescription>
          </CardHeader>
          <CardContent>
            {state.status === "loading" ? (
              <p className="text-sm text-slate-600">正在读取计划池。</p>
            ) : state.plans.length === 0 ? (
              <p className="text-sm text-slate-600">暂无计划。</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>顺序</TableHead>
                    <TableHead>URL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-mono text-slate-950">{plan.position + 1}</TableCell>
                      <TableCell className="break-all">{plan.url}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
