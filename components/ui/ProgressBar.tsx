"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  color?: string;
  tone?: "cyan" | "green" | "amber" | "red";
  label?: string;
  right?: string;
  height?: "thin" | "normal" | "thick";
  className?: string;
}

const TONE_COLORS: Record<string, string> = {
  cyan: "#22e6ff",
  green: "#22d3a5",
  amber: "#fbbf24",
  red: "#f43f5e",
};

export function ProgressBar({
  value,
  color,
  tone = "cyan",
  label,
  right,
  height = "normal",
  className,
}: ProgressBarProps) {
  const v = Math.max(0, Math.min(100, value));
  const c = color || TONE_COLORS[tone];
  const h = height === "thin" ? "h-px" : height === "thick" ? "h-2.5" : "h-1.5";

  return (
    <div className={cn("w-full", className)}>
      {(label || right) && (
        <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-widest">
          <span className="text-slate-500">{label}</span>
          <span className="font-mono text-slate-400 tabular">{right}</span>
        </div>
      )}
      <div className={cn("w-full overflow-hidden rounded-full bg-white/[0.04]", h)}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${v}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${c}99, ${c})`,
            boxShadow: `0 0 8px ${c}44`,
          }}
        />
      </div>
    </div>
  );
}
