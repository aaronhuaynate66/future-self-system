"use client";

import { useEffect, useMemo, useState } from "react";
import { WEEK_SCHEDULE, DAYS, ACTIVITY_PALETTE, HOUR_START, HOUR_END } from "@/data/schedule";
import { dayKeyOf, minutesOf } from "@/lib/schedule";
import type { DayKey, ScheduleBlock } from "@/types";

const ROW_H = 52; // px por hora
const TOTAL_HOURS = HOUR_END - HOUR_START;
const GRID_H = TOTAL_HOURS * ROW_H;

function positionTop(hhmm: string): number {
  const m = minutesOf(hhmm) - HOUR_START * 60;
  const totalMin = TOTAL_HOURS * 60;
  return Math.max(0, (m / totalMin) * GRID_H);
}

function DayColumn({
  dayKey,
  blocks,
  isToday,
}: {
  dayKey: DayKey;
  blocks: ScheduleBlock[];
  isToday: boolean;
}) {
  return (
    <div className={`relative border-r border-white/[0.04] ${isToday ? "bg-cyan-glow/[0.015]" : ""}`}>
      {blocks.map((b, i) => {
        const top = positionTop(b.start);
        const bottom = positionTop(b.end);
        const height = Math.max(22, bottom - top - 1);
        const p = ACTIVITY_PALETTE[b.kind];

        return (
          <div
            key={i}
            className="absolute left-1 right-1 overflow-hidden rounded-lg border transition-all hover:z-10 hover:scale-[1.01]"
            style={{
              top,
              height,
              background: p.bg,
              borderColor: p.border,
            }}
            title={`${b.start}–${b.end} · ${b.label}${b.detail ? ` · ${b.detail}` : ""}`}
          >
            <div className="flex h-full items-start gap-1.5 px-2 py-1">
              <div
                className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: p.color, boxShadow: `0 0 4px ${p.color}` }}
              />
              <div className="min-w-0">
                <div
                  className="truncate text-[10px] font-medium leading-tight"
                  style={{ color: p.text }}
                >
                  {b.label}
                </div>
                {b.detail && height > 38 && (
                  <div className="truncate text-[9px] opacity-60" style={{ color: p.text }}>
                    {b.detail}
                  </div>
                )}
                {height > 48 && (
                  <div className="font-mono text-[9px] opacity-40 tabular" style={{ color: p.text }}>
                    {b.start}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Legend() {
  const items = Object.entries(ACTIVITY_PALETTE).filter(
    ([k]) => !["transition", "commute", "wake", "shutdown"].includes(k)
  );
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.04] px-4 py-3">
      <span className="text-[9px] uppercase tracking-[0.3em] text-slate-700">Leyenda</span>
      {items.map(([k, p]) => (
        <div key={k} className="flex items-center gap-1.5">
          <div
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: p.color, boxShadow: `0 0 4px ${p.color}` }}
          />
          <span className="text-[10px] text-slate-600">{p.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function HorarioPage() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const hours = useMemo(() => {
    const arr: number[] = [];
    for (let h = HOUR_START; h <= HOUR_END; h++) arr.push(h);
    return arr;
  }, []);

  const todayKey = now ? dayKeyOf(now) : null;

  const nowOffset = useMemo(() => {
    if (!now) return null;
    const nowM = now.getHours() * 60 + now.getMinutes();
    const startM = HOUR_START * 60;
    const totalM = TOTAL_HOURS * 60;
    const pct = (nowM - startM) / totalM;
    return Math.max(0, Math.min(GRID_H, pct * GRID_H));
  }, [now]);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-[0.4em] text-slate-600">
          Aaron OS · Pantalla principal
        </div>
        <h1 className="mt-1 text-2xl font-semibold text-slate-100">Horario semanal</h1>
        <p className="mt-1 text-sm text-slate-600">
          Si está acá, se hace. Si no está acá, no entra.
        </p>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-950/60 shadow-card">
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Day headers */}
            <div className="grid grid-cols-[52px_repeat(7,minmax(0,1fr))] border-b border-white/[0.05] bg-ink-950/80">
              <div className="border-r border-white/[0.04] px-2 py-3 text-center">
                <span className="text-[10px] uppercase tracking-widest text-slate-700">h</span>
              </div>
              {DAYS.map((d) => {
                const isToday = todayKey === d.key;
                return (
                  <div
                    key={d.key}
                    className={`border-r border-white/[0.04] px-2 py-3 text-center ${
                      isToday ? "bg-cyan-glow/[0.04]" : ""
                    }`}
                  >
                    <div
                      className={`text-[11px] font-medium uppercase tracking-[0.18em] ${
                        isToday ? "text-cyan-soft" : "text-slate-500"
                      }`}
                    >
                      {d.label}
                    </div>
                    {isToday && (
                      <div className="mt-0.5 text-[9px] uppercase tracking-widest text-cyan-glow/60">
                        hoy
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Grid body */}
            <div className="relative">
              <div
                className="grid grid-cols-[52px_repeat(7,minmax(0,1fr))]"
                style={{ height: GRID_H }}
              >
                {/* Hour column */}
                <div className="relative border-r border-white/[0.04]">
                  {hours.map((h, i) => (
                    <div
                      key={h}
                      className="absolute left-0 right-0 flex items-start justify-end pr-2 text-[9px] font-mono text-slate-700 tabular"
                      style={{ top: i * ROW_H }}
                    >
                      {h.toString().padStart(2, "0")}
                    </div>
                  ))}
                </div>

                {/* Day columns */}
                {DAYS.map((d) => (
                  <DayColumn
                    key={d.key}
                    dayKey={d.key}
                    blocks={WEEK_SCHEDULE[d.key]}
                    isToday={todayKey === d.key}
                  />
                ))}
              </div>

              {/* Hour lines */}
              <div className="pointer-events-none absolute inset-0">
                {hours.map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-[52px] right-0 border-t border-white/[0.03]"
                    style={{ top: i * ROW_H }}
                  />
                ))}
              </div>

              {/* Now line */}
              {nowOffset !== null && todayKey && (
                <div
                  className="pointer-events-none absolute left-[52px] right-0"
                  style={{ top: nowOffset }}
                >
                  <div className="relative h-px bg-cyan-glow shadow-[0_0_8px_rgba(34,230,255,0.6)]">
                    <div className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-cyan-glow shadow-[0_0_8px_rgba(34,230,255,0.8)]" />
                  </div>
                </div>
              )}
            </div>

            <Legend />
          </div>
        </div>
      </div>
    </div>
  );
}
