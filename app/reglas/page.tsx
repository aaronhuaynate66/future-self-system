"use client";

import { motion } from "framer-motion";
import { Quote, ShieldCheck, Target, X, Eye, Zap, Heart, AlertTriangle } from "lucide-react";
import {
  FUTURE_SELF_RULES, MISSION, MISSION_SUB,
  STOPPED_TOLERATING, DETECTED_BLOCKS, NON_NEGOTIABLES,
  LIFE_VISION, CORE_QUOTE, DIAGNOSIS,
  SHORT_TERM_GOALS, MID_TERM_GOALS,
  INCOME_ACTUAL, INCOME_GOAL, CLIENT_GOAL, MARLAB_ANNUAL,
  CONTROL_DATES,
} from "@/data/rules";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 text-[10px] uppercase tracking-[0.4em] text-slate-600">{children}</div>
  );
}

function RuleCard({ text, index }: { text: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3"
    >
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-cyan-400/10 text-[10px] font-black text-cyan-400">
        {index + 1}
      </div>
      <span className="text-sm text-slate-300 leading-relaxed">{text}</span>
    </motion.div>
  );
}

function ItemRow({ text, color = "#64748b", icon: Icon }: {
  text: string; color?: string; icon?: React.ElementType;
}) {
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      {Icon
        ? <Icon size={13} className="mt-0.5 shrink-0" style={{ color }} />
        : <div className="mt-2 h-1 w-1 shrink-0 rounded-full" style={{ background: color }} />
      }
      <span className="text-sm text-slate-400">{text}</span>
    </div>
  );
}

export default function ReglasPage() {
  const now = new Date();

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-6 sm:px-6">

      {/* Header */}
      <div>
        <div className="text-[11px] uppercase tracking-[0.4em] text-slate-600">Identidad operativa</div>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-white">Reglas del Yo Futuro</h1>
        <p className="mt-1 text-sm text-slate-600">El modo de operación por defecto.</p>
      </div>

      {/* Misión */}
      <div className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] p-6">
        <div className="flex items-start gap-3">
          <Quote size={20} className="shrink-0 text-cyan-400 mt-0.5" />
          <div>
            <div className="text-2xl font-black text-white">{MISSION}</div>
            <div className="mt-1 text-sm text-slate-400">{MISSION_SUB}</div>
          </div>
        </div>
      </div>

      {/* Diagnóstico */}
      <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/[0.04] px-5 py-4">
        <div className="mb-1 flex items-center gap-2">
          <AlertTriangle size={13} className="text-yellow-400" />
          <span className="text-[10px] uppercase tracking-widest text-yellow-400">Diagnóstico real</span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{DIAGNOSIS}</p>
      </div>

      {/* Reglas */}
      <div>
        <SectionLabel>Reglas de operación</SectionLabel>
        <div className="space-y-2">
          {FUTURE_SELF_RULES.map((r, i) => (
            <RuleCard key={r.id} text={r.text} index={i} />
          ))}
        </div>
      </div>

      {/* Frase central */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-5 text-center">
        <Quote size={16} className="mx-auto mb-3 text-slate-700" />
        <div className="text-lg font-semibold italic text-slate-300">"{CORE_QUOTE}"</div>
      </div>

      {/* No negociables */}
      <div>
        <SectionLabel>No negociables del sistema</SectionLabel>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] px-5 py-4 space-y-1">
          {NON_NEGOTIABLES.map((item, i) => (
            <ItemRow key={i} text={item} color="#22d3a5" icon={ShieldCheck} />
          ))}
        </div>
      </div>

      {/* Grid — metas */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Corto plazo */}
        <div>
          <SectionLabel>Metas 0–3 meses</SectionLabel>
          <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] px-4 py-4 space-y-1.5">
            {SHORT_TERM_GOALS.map((g, i) => (
              <ItemRow key={i} text={g} color="#22e6ff" icon={Target} />
            ))}
          </div>
        </div>

        {/* Mediano plazo */}
        <div>
          <SectionLabel>Metas 6–12 meses</SectionLabel>
          <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] px-4 py-4 space-y-1.5">
            {MID_TERM_GOALS.map((g, i) => (
              <ItemRow key={i} text={g} color="#fbbf24" icon={Target} />
            ))}
          </div>
        </div>
      </div>

      {/* Finanzas en perspectiva */}
      <div>
        <SectionLabel>Contexto financiero</SectionLabel>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Ingreso actual",  value: `S/ ${INCOME_ACTUAL.toLocaleString("es-PE")}`, color: "#64748b", sub: "neto/mes" },
            { label: "Meta mensual",    value: `S/ ${INCOME_GOAL.toLocaleString("es-PE")}`,   color: "#22d3a5", sub: "objetivo" },
            { label: "Cliente mínimo",  value: `S/ ${CLIENT_GOAL.toLocaleString("es-PE")}`,   color: "#22e6ff", sub: "recurrente" },
            { label: "MarLab anual",    value: `S/ ${(MARLAB_ANNUAL/1000).toFixed(0)}k`,       color: "#fbbf24", sub: "meta 12 meses" },
          ].map(({ label, value, color, sub }) => (
            <div key={label} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-center">
              <div className="text-[9px] uppercase tracking-widest text-slate-600">{label}</div>
              <div className="mt-1 font-mono text-base font-black" style={{ color }}>{value}</div>
              <div className="text-[9px] text-slate-700">{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Visión de vida */}
      <div>
        <SectionLabel>Visión de vida ideal</SectionLabel>
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] px-5 py-4 space-y-1">
          {LIFE_VISION.map((item, i) => (
            <ItemRow key={i} text={item} color="#a78bfa" icon={Heart} />
          ))}
        </div>
      </div>

      {/* Lo que dejó de tolerar */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <SectionLabel>Dejó de tolerar</SectionLabel>
          <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.03] px-4 py-4 space-y-1">
            {STOPPED_TOLERATING.map((item, i) => (
              <ItemRow key={i} text={item} color="#f43f5e" icon={X} />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Bloqueos identificados</SectionLabel>
          <div className="rounded-2xl border border-orange-500/15 bg-orange-500/[0.03] px-4 py-4 space-y-1">
            {DETECTED_BLOCKS.map((item, i) => (
              <ItemRow key={i} text={item} color="#f97316" icon={Zap} />
            ))}
          </div>
        </div>
      </div>

      {/* Fechas de control */}
      <div>
        <SectionLabel>Fechas de control del plan</SectionLabel>
        <div className="space-y-2">
          {CONTROL_DATES.map(d => {
            const date  = new Date(d.date + "T12:00:00");
            const isPast = date < now;
            const isToday = date.toDateString() === now.toDateString();
            const colorMap = {
              pilot:  "#64748b",
              start:  "#22d3a5",
              review: "#22e6ff",
              close:  "#fbbf24",
              worlds: "#f43f5e",
            };
            const color = colorMap[d.kind];
            return (
              <div key={d.date}
                className={`flex items-center gap-4 rounded-xl border px-4 py-3 transition-all ${isToday ? "border-cyan-400/30" : "border-white/[0.05]"}`}
                style={{ background: isToday ? "rgba(34,230,255,0.04)" : "rgba(255,255,255,0.01)", opacity: isPast && !isToday ? 0.45 : 1 }}
              >
                <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: color, boxShadow: isToday ? `0 0 8px ${color}` : "none" }} />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${isPast && !isToday ? "text-slate-600" : "text-slate-200"}`}>
                    {d.label}
                    {isToday && <span className="ml-2 text-[9px] font-bold uppercase tracking-widest text-cyan-400">hoy</span>}
                  </div>
                  <div className="text-[10px] text-slate-600">{d.detail}</div>
                </div>
                {isPast && !isToday && (
                  <div className="text-[10px] text-slate-700">✓</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
