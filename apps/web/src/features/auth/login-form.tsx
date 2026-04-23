import { useState } from "react";

import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { postJson } from "../../lib/api";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "请求失败，请稍后再试。";
}

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await postJson("/api/auth/login", { username, password });
      window.location.href = "/dashboard";
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="shell-eyebrow">Microsoft Auto Learn</p>
          <CardTitle>管理员登录</CardTitle>
          <CardDescription>登录后可维护账号池、计划池并进入控制台。</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="login-username">
              用户名
              <Input
                id="login-username"
                aria-label="Username"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="login-password">
              密码
              <Input
                id="login-password"
                aria-label="Password"
                autoComplete="current-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            {errorMessage ? <p className="text-sm text-red-700">{errorMessage}</p> : null}
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "登录中..." : "登录"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
