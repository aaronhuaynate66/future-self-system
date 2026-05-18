"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  label: string;
  color: string;
  pulse?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({ label, color, pulse = false, size = "md", className }: BadgeProps) {
  const sz = size === "sm" ? "px-2.5 py-1 text-[10px] gap-1.5" : "px-3.5 py-1.5 text-xs gap-2";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium uppercase tracking-[0.22em]",
        sz,
        className
      )}
      style={{
        color,
        borderColor: color + "40",
        background: color + "0e",
        boxShadow: `0 0 12px ${color}18`,
      }}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full flex-shrink-0",
          pulse && "animate-pulse-dot"
        )}
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
      />
      {label}
    </span>
  );
}
