"use client";

import { useEffect, useState } from "react";
import { useAppState } from "@/lib/state";
import { statusFromLog, STATUS_META } from "@/lib/operational";
import { summarizeWeek } from "@/lib/score";
import { todayIso, formatTime } from "@/lib/dates";
import { StatusBadge } from "@/components/ui/Badge";
import { TIER_META } from "@/lib/score";

export function Header() {
  const { state } = useAppState();
  const [time, setTime] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => setTime(formatTime(new Date()));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  const today = todayIso();
  const todayLog = state.dailyLogs.find((l) => l.date === today) ?? null;
  const status = statusFromLog(todayLog);
  const statusMeta = STATUS_META[status];

  const weekSummary = summarizeWeek(state.dailyLogs, new Date());
  const tierMeta = TIER_META[weekSummary.tier];

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.05] bg-ink-950/70 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-8">
        {/* Left: clock */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <div className="font-mono text-base font-medium tabular text-slate-200">
              {mounted ? time : "--:--"}
            </div>
          </div>
        </div>

        {/* Center: status */}
        <div className="flex items-center gap-3">
          <StatusBadge
            label={statusMeta.label}
            color={statusMeta.color}
            pulse={status === "LOCKED_IN"}
            size="sm"
          />
        </div>

        {/* Right: score semanal */}
        <div className="flex items-center gap-3">
          {weekSummary.daysLogged > 0 && (
            <div className="hidden items-center gap-2 md:flex">
              <span className="text-[10px] uppercase tracking-widest text-slate-600">
                Score
              </span>
              <span
                className="font-mono text-sm font-semibold tabular"
                style={{ color: tierMeta.color }}
              >
                {weekSummary.score}
              </span>
              <span
                className="text-[10px] font-medium uppercase tracking-widest"
                style={{ color: tierMeta.color + "99" }}
              >
                {weekSummary.tier}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
