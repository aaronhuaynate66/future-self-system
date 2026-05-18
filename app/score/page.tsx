"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { useAppState } from "@/lib/state";
import { summarizeWeek, scoreDay, TIER_META, weekBounds, getSystemMode } from "@/lib/score";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { DailyLog } from "@/types";

// ----------------------------------------------------------------
// SCORE GAUGE SVG
// ----------------------------------------------------------------
function ScoreGauge({ score, color }: { score: number; color: string }) {
  const size = 180;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const arc = c * 0.75; // 270° arc
  const offset = arc - (score / 100) * arc;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="rotate-[135deg]"
        style={{ overflow: "visible" }}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${arc} ${c - arc}`}
          strokeLinecap="round"
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${arc} ${c - arc}`}
          initial={{ strokeDashoffset: arc }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 12px ${color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center -rotate-0">
        <span
          className="font-mono text-4xl font-bold tabular leading-none"
          style={{ color }}
        >
          {score}
        </span>
        <span className="mt-1 text-[10px] uppercase tracking-[0.3em] text-slate-600">
          / 100
        </span>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// DAY CELL
// ----------------------------------------------------------------
const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function DayCell({ iso, log }: { iso: string; log?: DailyLog }) {
  const idx = (new Date(iso + "T12:00:00").getDay() + 6) % 7;
  const label = DAY_LABELS[idx];
  const score = log ? scoreDay(log) : null;
  const color =
    score === null ? "#1e293b"
    : score >= 80 ? "#22d3a5"
    : score >= 60 ? "#22e6ff"
    : score >= 40 ? "#fbbf24"
    : "#f43f5e";

  return (
    <div
      className="rounded-xl border p-3 text-center transition-all"
      style={{
        borderColor: score !== null ? color + "30" : "rgba(255,255,255,0.04)",
        background: score !== null ? color + "08" : "rgba(255,255,255,0.01)",
      }}
    >
      <div className="text-[10px] uppercase tracking-widest text-slate-600">{label}</div>
      <div className="mt-0.5 font-mono text-[10px] text-slate-700 tabular">{iso.slice(5)}</div>
      <div
        className="mt-2 font-mono text-2xl font-semibold tabular"
        style={{ color: score !== null ? color : "#1e293b" }}
      >
        {score ?? "—"}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// RECOVERY MODE PANEL
// ----------------------------------------------------------------
function RecoveryPanel({ score }: { score: number }) {
  return (
    <Card variant="flat" className="border-signal-red/15">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-signal-red animate-pulse-dot" />
          <span className="text-sm font-medium uppercase tracking-widest text-signal-red">
            Recovery Mode
          </span>
        </div>
        <p className="text-sm text-slate-400">
          El sistema está en modo recuperación. Score en <span className="text-signal-red font-mono">{score}</span>.
          No agregar nuevas tareas. Enfocarse solo en lo esencial.
        </p>
        <div className="space-y-2">
          {["Dormir 8 horas mínimo", "Entrenar aunque sea 20 minutos", "No abrir proyectos nuevos", "Un solo Top 3 al día"].map((step, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-slate-500">
              <span className="font-mono text-[10px] text-signal-red">{i + 1}.</span>
              {step}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ----------------------------------------------------------------
// PAGE
// ----------------------------------------------------------------
function dayCells(weekStart: string): string[] {
  const out: string[] = [];
  const d = new Date(weekStart + "T12:00:00");
  for (let i = 0; i < 7; i++) {
    out.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export default function ScorePage() {
  const { state } = useAppState();
  const [ref, setRef] = useState(() => new Date());

  const summary = useMemo(() => summarizeWeek(state.dailyLogs, ref), [state.dailyLogs, ref]);
  const systemMode = getSystemMode(summary.score);
  const tierMeta = TIER_META[summary.tier];
  const bounds = weekBounds(ref);

  function shift(weeks: number) {
    const d = new Date(ref);
    d.setDate(d.getDate() + weeks * 7);
    setRef(d);
  }

  const W = {
    trained: { label: "Gym", pct: 25, color: "#22d3a5" },
    checkedDashboard: { label: "Dashboard", pct: 20, color: "#22e6ff" },
    commercialMove: { label: "Comercial", pct: 20, color: "#2dd4bf" },
    peaceVerde: { label: "Paz mental", pct: 20, color: "#7df3ff" },
    sleepBien: { label: "Sueño", pct: 15, color: "#a78bfa" },
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.4em] text-slate-600">
            Aaron OS · Lectura semanal
          </div>
          <h1 className="mt-1 text-2xl font-semibold text-slate-100">Score semanal</h1>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="subtle" onClick={() => shift(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="subtle" onClick={() => setRef(new Date())}>
            Esta semana
          </Button>
          <Button size="sm" variant="subtle" onClick={() => shift(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Recovery Mode */}
      {systemMode === "RECOVERY" && summary.daysLogged > 0 && (
        <RecoveryPanel score={summary.score} />
      )}

      {/* Score principal */}
      <Card>
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-center">
          {/* Gauge */}
          <div className="flex-shrink-0">
            <ScoreGauge score={summary.score} color={tierMeta.color} />
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <div
                className="text-3xl font-bold uppercase tracking-widest"
                style={{ color: tierMeta.color }}
              >
                {tierMeta.label}
              </div>
              <div className="mt-1 text-sm text-slate-500">{tierMeta.description}</div>
              <div className="mt-1 text-xs text-slate-700">
                {bounds.start} → {bounds.end} · {summary.daysLogged} días registrados
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-2">
              {Object.entries(W).map(([key, meta]) => {
                const val = summary.breakdown[key as keyof typeof summary.breakdown] as number;
                const daysMax = Math.max(1, summary.daysLogged);
                const pct = key === "peaceVerde" || key === "sleepBien"
                  ? (val / daysMax) * 100
                  : (val / daysMax) * 100;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className="w-24 text-[10px] uppercase tracking-widest text-slate-600">
                      {meta.label}
                    </div>
                    <div className="flex-1">
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, pct)}%` }}
                          transition={{ duration: 0.6, delay: 0.1 }}
                          className="h-full rounded-full"
                          style={{
                            background: meta.color,
                            boxShadow: `0 0 6px ${meta.color}44`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-8 text-right font-mono text-[11px] text-slate-500 tabular">
                      {val}/{daysMax}
                    </div>
                    <div className="w-7 text-right text-[10px] text-slate-700">
                      {meta.pct}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Celdas diarias */}
      <Card title="Semana" hint={`${bounds.start} → ${bounds.end}`}>
        <div className="grid grid-cols-7 gap-2">
          {dayCells(summary.weekStart).map((iso) => {
            const log = summary.days.find((d) => d.date === iso);
            return <DayCell key={iso} iso={iso} log={log} />;
          })}
        </div>
      </Card>

      {/* Alertas */}
      {summary.alerts.length > 0 && (
        <div className="space-y-2">
          {summary.alerts.map((a, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border border-signal-amber/15 bg-signal-amber/[0.04] px-4 py-3 text-sm text-signal-amber"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {a}
            </div>
          ))}
        </div>
      )}

      {/* Tiers reference */}
      <Card title="Referencia de tiers" variant="flat">
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(TIER_META).map(([tier, meta]) => (
            <div key={tier} className="rounded-lg border border-white/[0.04] p-2 text-center">
              <div className="font-mono text-base font-bold" style={{ color: meta.color }}>
                {tier}
              </div>
              <div className="text-[9px] text-slate-700">{meta.range}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
