"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Plus, X, ArrowRight, Clock, Dumbbell, LineChart, Phone, Brain, Moon } from "lucide-react";
import { useAppState } from "@/lib/state";
import { statusFromLog, STATUS_META } from "@/lib/operational";
import { summarizeWeek, getSystemMode, TIER_META } from "@/lib/score";
import { currentAndNext, timeUntilNext } from "@/lib/schedule";
import { todayIso, formatLongDate } from "@/lib/dates";
import { ACTIVITY_PALETTE } from "@/data/schedule";
import { MISSION, MISSION_SUB } from "@/data/rules";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";
import type { DailyLog, PeaceFlag, SleepFlag } from "@/types";

// ----------------------------------------------------------------
// RECOVERY MODE OVERLAY
// ----------------------------------------------------------------
function RecoveryBanner({ score }: { score: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-2xl border border-signal-red/20 bg-signal-red/[0.05] px-5 py-4"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 h-2 w-2 rounded-full bg-signal-red animate-pulse-dot flex-shrink-0" />
        <div>
          <div className="text-sm font-medium uppercase tracking-widest text-signal-red">
            Recovery Mode activo
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Score en {score}. Reducir carga, recuperar estructura. Hoy: dormir, agua, calma.
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ----------------------------------------------------------------
// SEMÁFORO MENTAL
// ----------------------------------------------------------------
function MentalSemaphore({ peace }: { peace: "verde" | "amarillo" | "rojo" | null }) {
  const levels = [
    { key: "verde",    color: "#22d3a5", label: "Paz" },
    { key: "amarillo", color: "#fbbf24", label: "Alerta" },
    { key: "rojo",     color: "#f43f5e", label: "Ruido" },
  ] as const;

  return (
    <div className="flex items-center gap-2">
      {levels.map((l) => {
        const active = peace === l.key;
        return (
          <div
            key={l.key}
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-all duration-300",
              active ? "scale-125" : "opacity-20"
            )}
            style={{
              background: active ? l.color : l.color + "44",
              boxShadow: active ? `0 0 8px ${l.color}` : "none",
            }}
          />
        );
      })}
      <span className="ml-1 text-[10px] uppercase tracking-widest text-slate-600">
        {peace ? (peace === "verde" ? "Paz" : peace === "amarillo" ? "Atención" : "Ruido") : "—"}
      </span>
    </div>
  );
}

// ----------------------------------------------------------------
// BLOQUE ACTUAL — Timeline
// ----------------------------------------------------------------
function CurrentBlockPanel() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  if (!now) return null;

  const { current, next, progress } = currentAndNext(now);
  const timeUntil = timeUntilNext(next, now);

  return (
    <Card title="Ahora" hint="Timeline" className="col-span-full md:col-span-2">
      <div className="space-y-3">
        {/* Bloque actual */}
        {current ? (
          <div
            className="rounded-xl border p-4"
            style={{
              background: ACTIVITY_PALETTE[current.kind].bg,
              borderColor: ACTIVITY_PALETTE[current.kind].border,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-2.5 w-2.5 rounded-full animate-pulse-dot"
                  style={{
                    background: ACTIVITY_PALETTE[current.kind].color,
                    boxShadow: `0 0 8px ${ACTIVITY_PALETTE[current.kind].color}`,
                  }}
                />
                <div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: ACTIVITY_PALETTE[current.kind].text }}
                  >
                    {current.label}
                  </div>
                  {current.detail && (
                    <div className="text-[10px] uppercase tracking-widest text-slate-600">
                      {current.detail}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-xs text-slate-500 tabular">
                  {current.start}–{current.end}
                </div>
              </div>
            </div>
            <ProgressBar value={progress} color={ACTIVITY_PALETTE[current.kind].color} height="thin" className="mt-3" />
          </div>
        ) : (
          <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Entre bloques</span>
            </div>
          </div>
        )}

        {/* Próximo bloque */}
        {next && (
          <div className="flex items-center gap-3 rounded-lg px-1">
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-700" />
            <div className="flex flex-1 items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-1.5 w-1.5 rounded-full opacity-60"
                  style={{ background: ACTIVITY_PALETTE[next.kind].color }}
                />
                <span className="text-xs text-slate-500">{next.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-slate-600 tabular">{next.start}</span>
                {timeUntil && (
                  <span className="text-[10px] uppercase tracking-widest text-slate-700">
                    en {timeUntil}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ----------------------------------------------------------------
// CHECKLIST
// ----------------------------------------------------------------
function DailyChecklistPanel() {
  const { state, dispatch } = useAppState();
  const today = todayIso();
  const log = state.dailyLogs.find((l) => l.date === today);

  function upsert(patch: Partial<DailyLog>) {
    const base: DailyLog = log ?? {
      id: "",
      date: today,
      trained: false,
      checkedDashboard: false,
      commercialMove: false,
      peace: "amarillo",
      sleep: "regular",
      migraine: false,
      argued: false,
      note: "",
    };
    dispatch({ type: "UPSERT_DAILY_LOG", payload: { ...base, ...patch } });
  }

  const boolItems = [
    { key: "trained" as const,          label: "Entrené",            icon: <Dumbbell className="h-3.5 w-3.5" /> },
    { key: "checkedDashboard" as const, label: "Revisé dashboard",   icon: <LineChart className="h-3.5 w-3.5" /> },
    { key: "commercialMove" as const,   label: "Movimiento comercial", icon: <Phone className="h-3.5 w-3.5" /> },
  ];

  const done = boolItems.filter((i) => log?.[i.key]).length +
    (log?.peace === "verde" ? 1 : 0) +
    (log?.sleep === "bien" ? 1 : 0);
  const total = 5;

  return (
    <Card title="Checklist" hint={`${done}/${total}`} className="col-span-full md:col-span-1">
      <div className="space-y-1.5">
        {boolItems.map((item) => {
          const on = !!log?.[item.key];
          return (
            <button
              key={item.key}
              onClick={() => upsert({ [item.key]: !on } as Partial<DailyLog>)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-all",
                on
                  ? "border-signal-green/25 bg-signal-green/[0.07] text-slate-200"
                  : "border-white/[0.05] bg-transparent text-slate-500 hover:border-white/[0.08] hover:text-slate-300"
              )}
            >
              <span className={cn(
                "flex h-5 w-5 items-center justify-center rounded border transition-all",
                on
                  ? "border-signal-green bg-signal-green/20 text-signal-green"
                  : "border-slate-700 text-transparent"
              )}>
                <Check className="h-3 w-3" />
              </span>
              <span className="text-slate-500 opacity-60">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Paz mental */}
        <div className="flex items-center justify-between rounded-xl border border-white/[0.05] px-3 py-2.5">
          <div className="flex items-center gap-3">
            <Brain className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-sm text-slate-500">Paz mental</span>
          </div>
          <div className="flex gap-1.5">
            {(["verde", "amarillo", "rojo"] as PeaceFlag[]).map((v) => {
              const colors = { verde: "#22d3a5", amarillo: "#fbbf24", rojo: "#f43f5e" };
              const active = log?.peace === v;
              return (
                <button
                  key={v}
                  onClick={() => upsert({ peace: v })}
                  className="h-5 w-5 rounded-full border transition-all"
                  style={{
                    background: active ? colors[v] : "transparent",
                    borderColor: active ? colors[v] : colors[v] + "44",
                    boxShadow: active ? `0 0 8px ${colors[v]}88` : "none",
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Sueño */}
        <div className="flex items-center justify-between rounded-xl border border-white/[0.05] px-3 py-2.5">
          <div className="flex items-center gap-3">
            <Moon className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-sm text-slate-500">Dormí bien</span>
          </div>
          <div className="flex gap-1.5">
            {([
              { v: "bien" as SleepFlag, c: "#22d3a5" },
              { v: "regular" as SleepFlag, c: "#fbbf24" },
              { v: "mal" as SleepFlag, c: "#f43f5e" },
            ]).map(({ v, c }) => {
              const active = log?.sleep === v;
              return (
                <button
                  key={v}
                  onClick={() => upsert({ sleep: v })}
                  className="h-5 w-5 rounded-full border transition-all"
                  style={{
                    background: active ? c : "transparent",
                    borderColor: active ? c : c + "44",
                    boxShadow: active ? `0 0 8px ${c}88` : "none",
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Progress bar total */}
        <div className="pt-1">
          <ProgressBar
            value={(done / total) * 100}
            color={done === total ? "#22d3a5" : done >= 3 ? "#22e6ff" : "#fbbf24"}
            height="thin"
          />
        </div>
      </div>
    </Card>
  );
}

// ----------------------------------------------------------------
// TOP 3
// ----------------------------------------------------------------
function Top3Panel() {
  const { state, dispatch } = useAppState();
  const [draft, setDraft] = useState("");
  const today = todayIso();

  useEffect(() => {
    if (state.top3.date !== today) {
      dispatch({ type: "SET_TOP3_DATE", payload: { date: today } });
    }
  }, [today, state.top3.date, dispatch]);

  const tasks = state.top3.date === today ? state.top3.tasks : [];
  const full = tasks.length >= 3;

  function add() {
    const text = draft.trim();
    if (!text || full) return;
    dispatch({ type: "ADD_TOP_TASK", payload: { text } });
    setDraft("");
  }

  return (
    <Card title="Top 3" hint={`${tasks.length}/3`} className="col-span-full md:col-span-2">
      <div className="space-y-1.5">
        {tasks.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="group flex items-center gap-3 rounded-xl border border-white/[0.05] px-3 py-2.5"
          >
            <button
              onClick={() => dispatch({ type: "TOGGLE_TOP_TASK", payload: { id: t.id } })}
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all",
                t.done
                  ? "border-signal-green bg-signal-green/20 text-signal-green"
                  : "border-slate-700 hover:border-cyan-glow/50"
              )}
            >
              <Check className="h-3 w-3" />
            </button>
            <span className="font-mono text-[10px] text-slate-700">P{i + 1}</span>
            <span className={cn("flex-1 text-sm", t.done ? "text-slate-600 line-through" : "text-slate-200")}>
              {t.text}
            </span>
            <button
              onClick={() => dispatch({ type: "REMOVE_TOP_TASK", payload: { id: t.id } })}
              className="opacity-0 text-slate-700 transition-opacity hover:text-signal-red group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}

        {!full ? (
          <div className="flex gap-2 pt-1">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="Prioridad crítica del día…"
              className="flex-1 text-sm"
            />
            <Button onClick={add} variant="primary" size="sm">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-signal-amber/20 bg-signal-amber/[0.04] px-3 py-2 text-[11px] uppercase tracking-widest text-signal-amber">
            Solo 3 prioridades. Termina antes de abrir más.
          </div>
        )}
      </div>
    </Card>
  );
}

// ----------------------------------------------------------------
// PAGE PRINCIPAL
// ----------------------------------------------------------------
export default function HoyPage() {
  const { state } = useAppState();
  const today = todayIso();
  const todayLog = state.dailyLogs.find((l) => l.date === today) ?? null;
  const status = statusFromLog(todayLog);
  const statusMeta = STATUS_META[status];

  const weekSummary = useMemo(() => summarizeWeek(state.dailyLogs, new Date()), [state.dailyLogs]);
  const systemMode = getSystemMode(weekSummary.score);
  const tierMeta = TIER_META[weekSummary.tier];

  const [dateStr, setDateStr] = useState("");
  useEffect(() => {
    setDateStr(formatLongDate(new Date()));
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {/* Recovery Mode Banner */}
      {systemMode === "RECOVERY" && weekSummary.daysLogged > 0 && (
        <RecoveryBanner score={weekSummary.score} />
      )}

      {/* NIVEL 1 — Estado actual */}
      <div className="flex flex-col gap-1">
        <div className="text-[11px] uppercase tracking-[0.4em] text-slate-600">
          {dateStr || "—"}
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100">
              {MISSION}
            </h1>
            <p className="mt-0.5 text-sm text-slate-600">{MISSION_SUB}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge
              label={statusMeta.label}
              color={statusMeta.color}
              pulse={status === "LOCKED_IN"}
            />
            {weekSummary.daysLogged > 0 && (
              <div
                className="hidden rounded-xl border px-3 py-1.5 text-center md:block"
                style={{
                  borderColor: tierMeta.color + "30",
                  background: tierMeta.color + "08",
                }}
              >
                <div className="font-mono text-lg font-semibold tabular" style={{ color: tierMeta.color }}>
                  {weekSummary.score}
                </div>
                <div className="text-[9px] uppercase tracking-widest" style={{ color: tierMeta.color + "80" }}>
                  {tierMeta.label}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Semáforo mental */}
        <div className="mt-2 flex items-center gap-2">
          <MentalSemaphore peace={todayLog?.peace ?? null} />
          <span className="mx-2 text-slate-800">·</span>
          <span className="text-[10px] uppercase tracking-widest text-slate-700">
            {statusMeta.hint}
          </span>
        </div>
      </div>

      {/* Divisor sutil */}
      <div className="h-px bg-white/[0.05]" />

      {/* NIVEL 2 — El Día */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <CurrentBlockPanel />
        <DailyChecklistPanel />
      </div>

      <Top3Panel />

      {/* NIVEL 3 — Hint al score */}
      {weekSummary.alerts.length > 0 && (
        <div className="space-y-2">
          {weekSummary.alerts.map((a, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-signal-amber/15 bg-signal-amber/[0.04] px-4 py-3 text-sm text-signal-amber"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-signal-amber flex-shrink-0" />
              {a}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
