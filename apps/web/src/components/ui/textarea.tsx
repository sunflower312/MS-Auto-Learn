import type { TextareaHTMLAttributes } from "react";

import { cn } from "../../lib/cn";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full rounded-[1.25rem] border border-cyan-200 bg-white/90 px-4 py-3 text-sm text-slate-950 shadow-sm transition outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
}
