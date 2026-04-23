import { useState } from "react";

import { deleteJson, postJson } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Textarea } from "../../components/ui/textarea";

type FeedbackState = {
  tone: "neutral" | "success" | "error";
  message: string;
};

const EMPTY_FEEDBACK: FeedbackState = {
  tone: "neutral",
  message: "",
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "请求失败，请稍后再试。";
}

type AccountImportCardProps = {
  hasRecords?: boolean;
  onImported?: () => void;
  onCleared?: () => void;
};

export function AccountImportCard({ hasRecords = false, onImported, onCleared }: AccountImportCardProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(EMPTY_FEEDBACK);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!text.trim()) {
      setFeedback({
        tone: "error",
        message: "请输入账号文本。",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(EMPTY_FEEDBACK);

    try {
      await postJson("/api/accounts/import", { text });
      setFeedback({
        tone: "success",
        message: "账号池已更新。",
      });
      onImported?.();
    } catch (error) {
      setFeedback({
        tone: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleClear() {
    if (!hasRecords) {
      return;
    }

    setIsClearing(true);
    setFeedback(EMPTY_FEEDBACK);

    try {
      await deleteJson("/api/accounts");
      setFeedback({
        tone: "success",
        message: "账号池已清空。",
      });
      onCleared?.();
    } catch (error) {
      setFeedback({
        tone: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setIsClearing(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <p className="panel-kicker">Accounts</p>
        <CardTitle>导入账号池</CardTitle>
        <CardDescription>每行使用 `email----password` 格式。</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="accounts-text">
            Accounts text
          </label>
          <Textarea
            id="accounts-text"
            aria-label="Accounts text"
            rows={10}
            placeholder={"user@example.com----secret123"}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={isSubmitting || isClearing}>
              {isSubmitting ? "导入中..." : "导入账号"}
            </Button>
            <Button
              variant="destructive"
              disabled={!hasRecords || isSubmitting || isClearing}
              onClick={handleClear}
            >
              {isClearing ? "清空中..." : "清空账号"}
            </Button>
            <span className={`feedback feedback-${feedback.tone}`} role="status">
              {feedback.message}
            </span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
