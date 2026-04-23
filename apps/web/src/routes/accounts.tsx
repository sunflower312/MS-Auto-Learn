import { useEffect, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { AccountImportCard } from "../features/accounts/account-import-card";
import { getJson } from "../lib/api";

type AccountRecord = {
  id: number;
  email: string;
  enabled: boolean;
};

export function AccountsRoute() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadAccounts() {
      try {
        const response = await getJson<{ accounts?: AccountRecord[] }>("/api/accounts");
        if (!isActive) {
          return;
        }

        setAccounts(response.accounts ?? []);
        setStatus("ready");
        setErrorMessage("");
      } catch (error) {
        if (!isActive) {
          return;
        }

        setAccounts([]);
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "请求失败，请稍后再试。");
      }
    }

    void loadAccounts();

    return () => {
      isActive = false;
    };
  }, [refreshToken]);

  return (
    <section className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div>
          <AccountImportCard
            hasRecords={accounts.length > 0}
            onImported={() => setRefreshToken((value) => value + 1)}
            onCleared={() => setRefreshToken((value) => value + 1)}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>账号池</CardTitle>
            <CardDescription>当前只保留邮箱、加密密码和启用状态。</CardDescription>
          </CardHeader>
          <CardContent>
            {status === "loading" ? (
              <p className="text-sm text-slate-600">正在读取账号池。</p>
            ) : status === "error" ? (
              <p className="text-sm text-red-700">{errorMessage}</p>
            ) : accounts.length === 0 ? (
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
                  {accounts.map((account) => (
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
      </div>
    </section>
  );
}
