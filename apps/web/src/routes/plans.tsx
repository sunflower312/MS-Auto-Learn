import { useEffect, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { PlanImportCard } from "../features/plans/plan-import-card";
import { getJson } from "../lib/api";

type PlanRecord = {
  id: number;
  url: string;
  position: number;
  enabled: boolean;
};

export function PlansRoute() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadPlans() {
      try {
        const response = await getJson<{ plans?: PlanRecord[] }>("/api/plans");
        if (!isActive) {
          return;
        }

        setPlans(response.plans ?? []);
        setStatus("ready");
        setErrorMessage("");
      } catch (error) {
        if (!isActive) {
          return;
        }

        setPlans([]);
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "请求失败，请稍后再试。");
      }
    }

    void loadPlans();

    return () => {
      isActive = false;
    };
  }, [refreshToken]);

  return (
    <section className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div>
          <PlanImportCard
            hasRecords={plans.length > 0}
            onImported={() => setRefreshToken((value) => value + 1)}
            onCleared={() => setRefreshToken((value) => value + 1)}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>计划池</CardTitle>
            <CardDescription>按行导入、按顺序存储，等待新的运行域接入。</CardDescription>
          </CardHeader>
          <CardContent>
            {status === "loading" ? (
              <p className="text-sm text-slate-600">正在读取计划池。</p>
            ) : status === "error" ? (
              <p className="text-sm text-red-700">{errorMessage}</p>
            ) : plans.length === 0 ? (
              <p className="text-sm text-slate-600">暂无计划。</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>顺序</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>启用</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-mono text-slate-950">{plan.position + 1}</TableCell>
                      <TableCell className="break-all">{plan.url}</TableCell>
                      <TableCell>{plan.enabled ? "是" : "否"}</TableCell>
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
