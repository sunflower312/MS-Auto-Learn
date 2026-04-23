import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "../../lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 disabled:pointer-events-none disabled:opacity-70 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-linear-to-r from-cyan-600 to-teal-600 px-5 py-3 text-white shadow-[0_12px_24px_rgba(8,145,178,0.24)] hover:from-cyan-500 hover:to-teal-500",
        secondary:
          "border border-cyan-200 bg-white/80 px-4 py-2.5 text-slate-900 hover:bg-cyan-50",
        ghost: "px-3 py-2 text-slate-700 hover:bg-cyan-50 hover:text-slate-950",
        destructive:
          "bg-red-600 px-5 py-3 text-white shadow-[0_12px_24px_rgba(185,28,28,0.2)] hover:bg-red-500",
      },
      size: {
        default: "",
        sm: "px-3 py-2 text-xs",
        lg: "px-6 py-3.5 text-base",
        icon: "size-10 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  asChild = false,
  className,
  size,
  variant,
  type = "button",
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      className={cn(buttonVariants({ variant, size }), className)}
      type={asChild ? undefined : type}
      {...props}
    />
  );
}
