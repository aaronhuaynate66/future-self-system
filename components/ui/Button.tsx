"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "danger" | "subtle";
type Size = "xs" | "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANT: Record<Variant, string> = {
  primary: "border-cyan-glow/30 bg-cyan-glow/[0.08] text-cyan-soft hover:bg-cyan-glow/[0.14] hover:border-cyan-glow/50",
  ghost:   "border-white/[0.07] bg-transparent text-slate-300 hover:border-white/[0.12] hover:text-slate-100",
  danger:  "border-signal-red/30 bg-signal-red/[0.07] text-signal-red hover:bg-signal-red/[0.12]",
  subtle:  "border-transparent bg-white/[0.04] text-slate-400 hover:bg-white/[0.07] hover:text-slate-200",
};

const SIZE: Record<Size, string> = {
  xs: "px-2.5 py-1 text-[10px] gap-1",
  sm: "px-3 py-1.5 text-[11px] gap-1.5",
  md: "px-4 py-2 text-xs gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "ghost", size = "md", className, ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg border font-medium uppercase tracking-widest transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40",
        VARIANT[variant],
        SIZE[size],
        className
      )}
      {...rest}
    />
  )
);
Button.displayName = "Button";
