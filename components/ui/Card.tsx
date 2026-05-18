"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLMotionProps<"div"> {
  title?: string;
  hint?: string;
  glow?: boolean;
  noPad?: boolean;
  variant?: "default" | "strong" | "flat";
}

export function Card({
  title,
  hint,
  glow = false,
  noPad = false,
  variant = "default",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "relative rounded-2xl shadow-card",
        variant === "default" && "glass",
        variant === "strong" && "glass-strong",
        variant === "flat" && "border border-white/[0.06] bg-white/[0.015]",
        glow && "shadow-glow",
        className
      )}
      {...rest}
    >
      {(title || hint) && (
        <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-3">
          {title && (
            <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-slate-400">
              {title}
            </span>
          )}
          {hint && (
            <span className="text-[10px] uppercase tracking-widest text-slate-600">
              {hint}
            </span>
          )}
        </div>
      )}
      <div className={cn(!noPad && "p-5")}>{children as React.ReactNode}</div>
    </motion.div>
  );
}
