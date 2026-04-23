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

type PlanImportCardProps = {
  hasRecords?: boolean;
  onImported?: () => void;
  onCleared?: () => void;
};

export function PlanImportCard({ hasRecords = false, onImported, onCleared }: PlanImportCardProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(EMPTY_FEEDBACK);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!text.trim()) {
      setFeedback({
        tone: "error",
        message: "请输入计划 URL 文本。",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(EMPTY_FEEDBACK);

    try {
      await postJson("/api/plans/import", { text });
      setFeedback({
        tone: "success",
        message: "计划池已更新。",
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
      await deleteJson("/api/plans");
      setFeedback({
        tone: "success",
        message: "计划池已清空。",
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
        <p className="panel-kicker">Plans</p>
        <CardTitle>导入计划池</CardTitle>
        <CardDescription>每行一个 Microsoft Learn 计划 URL。</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="plans-text">
            Plans text
          </label>
          <Textarea
            id="plans-text"
            aria-label="Plans text"
            rows={10}
            placeholder={"https://learn.microsoft.com/en-us/training/paths/example/"}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={isSubmitting || isClearing}>
              {isSubmitting ? "导入中..." : "导入计划"}
            </Button>
            <Button
              variant="destructive"
              disabled={!hasRecords || isSubmitting || isClearing}
              onClick={handleClear}
            >
              {isClearing ? "清空中..." : "清空计划"}
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
