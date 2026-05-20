"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Dumbbell, Heart, Target, CheckCircle2, Circle, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

// ── Fecha del mundial ─────────────────────────────────────────
const MUNDIAL_DATE = new Date("2026-11-01T00:00:00-05:00"); // Lima GMT-5
const PLAN_START   = new Date("2026-06-01T00:00:00-05:00");

// ── Plan físico 6 meses ───────────────────────────────────────
const PLAN_FASES = [
  {
    num: 1, mes: "Jun 2026", label: "Base aeróbica",
    semanas: "1–4",
    color: "#22d3a5",
    objetivo: "Construir base cardiovascular sin lesiones",
    entrenamientos: [
      "Carrera suave 3x/sem — 20–30 min",
      "Natación o bicicleta 2x/sem",
      "Fuerza funcional 2x/sem — peso corporal",
      "Movilidad 10 min diario",
    ],
    meta: "Correr 5km sin parar · FC en zona 2",
  },
  {
    num: 2, mes: "Jul 2026", label: "Fuerza + resistencia",
    semanas: "5–8",
    color: "#22e6ff",
    objetivo: "Aumentar fuerza funcional y resistencia mixta",
    entrenamientos: [
      "Carrera con intervalos 3x/sem",
      "Fuerza con carga 3x/sem — sentadilla, peso muerto, press",
      "Circuitos bombero 1x/sem — mangueras, escaleras, equipo",
      "Natación técnica 1x/sem",
    ],
    meta: "5km < 28 min · sentadilla 1.2x peso corporal",
  },
  {
    num: 3, mes: "Ago 2026", label: "Potencia + específico",
    semanas: "9–12",
    color: "#fbbf24",
    objetivo: "Transferir fuerza a movimientos de bombero",
    entrenamientos: [
      "Entrenamiento con equipo de protección 2x/sem",
      "HIIT + potencia 3x/sem",
      "Simulacros de pruebas técnicas 1x/sem",
      "Recuperación activa — yoga o movilidad",
    ],
    meta: "Completar simulacro completo · peso 78–80 kg",
  },
  {
    num: 4, mes: "Sep 2026", label: "Peak training",
    semanas: "13–16",
    color: "#f97316",
    objetivo: "Pico de rendimiento — máxima carga controlada",
    entrenamientos: [
      "Pruebas físicas completas 2x/sem",
      "Fuerza máxima 2x/sem",
      "Resistencia larga 1x/sem — 60–90 min",
      "Técnica de competencia semanal",
    ],
    meta: "Superar todos los estándares del mundial",
  },
  {
    num: 5, mes: "Oct 2026", label: "Afinamiento",
    semanas: "17–20",
    color: "#a78bfa",
    objetivo: "Mantener forma — reducir carga — llegar fresco",
    entrenamientos: [
      "Volumen –30% vs fase anterior",
      "Intensidad moderada — no forzar",
      "Técnica y simulacros 2x/sem",
      "Sueño y nutrición — prioridad máxima",
    ],
    meta: "Llegar al mundial en forma pico · peso 78 kg",
  },
  {
    num: 6, mes: "Nov 2026", label: "Mundial de Bomberos",
    semanas: "21",
    color: "#f43f5e",
    objetivo: "Competencia — todo el trabajo se muestra aquí",
    entrenamientos: [
      "Activación ligera 3 días antes",
      "Descanso 2 días antes",
      "Calentamiento específico el día",
      "Recuperación post-competencia",
    ],
    meta: "Competir al máximo nivel · representar con orgullo",
  },
];

// ── Checklist de preparación ──────────────────────────────────
const PREP_ITEMS = [
  { id: "gym",       label: "Gym activo — mínimo 3x/sem",        category: "físico"    },
  { id: "cardio",    label: "Cardio base establecido",            category: "físico"    },
  { id: "peso",      label: "Peso bajando hacia 78 kg",           category: "físico"    },
  { id: "pasaporte", label: "Pasaporte vigente",                  category: "logística" },
  { id: "inscripcion",label: "Inscripción al mundial confirmada", category: "logística" },
  { id: "vuelos",    label: "Vuelos reservados",                  category: "logística" },
  { id: "equipo",    label: "Equipo de competencia listo",        category: "logística" },
  { id: "ahorro",    label: "Presupuesto del viaje cubierto",     category: "financiero"},
  { id: "uniforme",  label: "Uniforme del equipo confirmado",     category: "logística" },
];

const STORAGE_KEY = "aaron_mundial_prep";

function loadPrep(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}"); } catch { return {}; }
}
function savePrep(data: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ── Countdown ─────────────────────────────────────────────────
function useCountdown() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = MUNDIAL_DATE.getTime() - now.getTime();
  const total = MUNDIAL_DATE.getTime() - PLAN_START.getTime();
  const elapsed = now.getTime() - PLAN_START.getTime();
  const pct = Math.max(0, Math.min(100, (elapsed / total) * 100));

  const days    = Math.max(0, Math.floor(diff / 86400000));
  const hours   = Math.max(0, Math.floor((diff % 86400000) / 3600000));
  const minutes = Math.max(0, Math.floor((diff % 3600000) / 60000));
  const seconds = Math.max(0, Math.floor((diff % 60000) / 1000));

  // Fase actual
  const monthsLeft = diff / (30 * 86400000);
  let currentFase = 0;
  if (monthsLeft <= 1) currentFase = 5;
  else if (monthsLeft <= 2) currentFase = 4;
  else if (monthsLeft <= 3) currentFase = 3;
  else if (monthsLeft <= 4) currentFase = 2;
  else if (monthsLeft <= 5) currentFase = 1;

  return { days, hours, minutes, seconds, pct, currentFase, diff };
}

// ── MAIN PAGE ─────────────────────────────────────────────────
export default function MundialPage() {
  const { days, hours, minutes, seconds, pct, currentFase } = useCountdown();
  const [prep, setPrep]     = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);
  const [expandedFase, setExpandedFase] = useState<number | null>(currentFase);

  useEffect(() => {
    setPrep(loadPrep());
    setMounted(true);
    setExpandedFase(currentFase);
  }, [currentFase]);

  function togglePrep(id: string) {
    const updated = { ...prep, [id]: !prep[id] };
    setPrep(updated);
    savePrep(updated);
  }

  const prepDone  = PREP_ITEMS.filter(i => prep[i.id]).length;
  const prepTotal = PREP_ITEMS.length;
  const prepPct   = Math.round((prepDone / prepTotal) * 100);

  const fisico    = PREP_ITEMS.filter(i => i.category === "físico");
  const logistica = PREP_ITEMS.filter(i => i.category === "logística");
  const financiero = PREP_ITEMS.filter(i => i.category === "financiero");

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10">
          <Flame size={20} className="text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Mundial de Bomberos</h1>
          <p className="mt-0.5 text-sm text-slate-500">Noviembre 2026 · Plan de preparación 6 meses</p>
        </div>
      </div>

      {/* Countdown principal */}
      <div className="overflow-hidden rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-500/[0.06] to-orange-500/[0.03]">
        <div className="p-6">
          <div className="mb-2 text-[11px] uppercase tracking-[0.4em] text-red-400/70">Faltan</div>
          <div className="flex items-end gap-3 sm:gap-6">
            {[
              { val: days,    label: "días"    },
              { val: hours,   label: "horas"   },
              { val: minutes, label: "min"     },
              { val: seconds, label: "seg"     },
            ].map(({ val, label }, i) => (
              <div key={label} className="flex items-end gap-1">
                {i > 0 && <span className="mb-3 text-2xl font-black text-red-500/40">:</span>}
                <div className="text-center">
                  <motion.div
                    key={val}
                    initial={{ y: -4, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="font-mono font-black tabular-nums text-white"
                    style={{ fontSize: label === "días" ? "48px" : "32px",
                      textShadow: "0 0 32px rgba(239,68,68,0.3)" }}
                  >
                    {String(val).padStart(2, "0")}
                  </motion.div>
                  <div className="mt-1 text-[10px] uppercase tracking-widest text-slate-600">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Progreso del plan */}
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-[10px] text-slate-600">
              <span>Inicio plan — Jun 2026</span>
              <span className="text-red-400">{pct.toFixed(0)}% del camino</span>
              <span>Mundial — Nov 2026</span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg,#22d3a5,#fbbf24,#f43f5e)" }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <div className="mt-2 text-center text-xs text-slate-500">
              Fase actual: <span className="font-semibold text-slate-300">{PLAN_FASES[currentFase].label}</span>
              {" · "}{PLAN_FASES[currentFase].mes}
            </div>
          </div>
        </div>
      </div>

      {/* Checklist preparación */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-200">Preparación general</div>
            <div className="text-[11px] text-slate-600">{prepDone}/{prepTotal} completado</div>
          </div>
          <div className="flex items-center gap-2">
            {prepPct < 50 && <AlertTriangle size={14} className="text-yellow-400" />}
            {prepPct >= 100 && <CheckCircle2 size={14} className="text-emerald-400" />}
            <span className="font-mono text-lg font-black" style={{
              color: prepPct >= 80 ? "#22d3a5" : prepPct >= 50 ? "#fbbf24" : "#f43f5e"
            }}>{prepPct}%</span>
          </div>
        </div>
        <ProgressBar value={prepPct} color={prepPct >= 80 ? "#22d3a5" : prepPct >= 50 ? "#fbbf24" : "#f43f5e"} height="thin" className="mb-5" />

        {/* Por categoría */}
        {[
          { label: "Físico", items: fisico, icon: Dumbbell, color: "#22d3a5" },
          { label: "Logística", items: logistica, icon: Target, color: "#22e6ff" },
          { label: "Financiero", items: financiero, icon: Heart, color: "#fbbf24" },
        ].map(({ label, items, icon: Icon, color }) => (
          <div key={label} className="mb-4 last:mb-0">
            <div className="mb-2 flex items-center gap-2">
              <Icon size={12} style={{ color }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>{label}</span>
            </div>
            <div className="space-y-1.5">
              {items.map(item => (
                <button
                  key={item.id}
                  onClick={() => togglePrep(item.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 py-2.5 text-left transition-all hover:border-white/[0.08]"
                >
                  {prep[item.id]
                    ? <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                    : <Circle size={15} className="shrink-0 text-slate-700" />
                  }
                  <span className={`text-xs ${prep[item.id] ? "text-slate-400 line-through" : "text-slate-300"}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </Card>

      {/* Plan físico 6 fases */}
      <div>
        <div className="mb-3 text-[11px] uppercase tracking-widest text-slate-500">Plan físico — 6 fases</div>
        <div className="space-y-2">
          {PLAN_FASES.map((fase, i) => {
            const isActive   = i === currentFase;
            const isPast     = i < currentFase;
            const isExpanded = expandedFase === i;

            return (
              <div
                key={fase.num}
                className="overflow-hidden rounded-2xl border transition-all"
                style={{
                  borderColor: isActive ? `${fase.color}40` : "rgba(255,255,255,0.05)",
                  background: isActive ? `${fase.color}08` : "rgba(255,255,255,0.01)",
                }}
              >
                <button
                  onClick={() => setExpandedFase(isExpanded ? null : i)}
                  className="flex w-full items-center gap-4 px-4 py-3 text-left"
                >
                  {/* Número */}
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black"
                    style={{
                      background: isPast ? `${fase.color}20` : isActive ? `${fase.color}25` : "rgba(255,255,255,0.04)",
                      color: isPast || isActive ? fase.color : "#475569",
                      boxShadow: isActive ? `0 0 12px ${fase.color}44` : "none",
                    }}
                  >
                    {isPast ? "✓" : fase.num}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${isActive ? "text-white" : isPast ? "text-slate-500" : "text-slate-400"}`}>
                        {fase.label}
                      </span>
                      {isActive && (
                        <span className="rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest"
                          style={{ borderColor: `${fase.color}40`, color: fase.color, background: `${fase.color}10` }}>
                          Ahora
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-600">{fase.mes} · Semanas {fase.semanas}</div>
                  </div>

                  <div className="text-slate-700 text-sm">{isExpanded ? "▲" : "▼"}</div>
                </button>

                {/* Detalle expandible */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-white/[0.04] px-4 pb-4 pt-3"
                  >
                    <div className="mb-3 text-xs text-slate-400">{fase.objetivo}</div>

                    <div className="mb-3 space-y-1.5">
                      {fase.entrenamientos.map((e, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: fase.color }} />
                          <span className="text-xs text-slate-400">{e}</span>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl border px-3 py-2"
                      style={{ borderColor: `${fase.color}25`, background: `${fase.color}08` }}>
                      <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: fase.color }}>Meta de la fase</div>
                      <div className="text-xs text-slate-300">{fase.meta}</div>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivación */}
      <div className="rounded-2xl border border-white/[0.04] bg-white/[0.01] p-5 text-center">
        <div className="text-2xl mb-2">🔥</div>
        <div className="text-sm font-semibold text-slate-300">
          {days > 150 ? "Tiempo suficiente para llegar en forma pico. Empieza hoy." :
           days > 90  ? "El trabajo de base ahora define el resultado en noviembre." :
           days > 60  ? "Estás en la fase crítica. Cada sesión cuenta." :
           days > 30  ? "Último mes. Mantén la forma. No improvises." :
                        "La semana del mundial. Confía en el trabajo hecho."}
        </div>
        <div className="mt-1 text-xs text-slate-600">Conseguir paz. Ganar el mundial. Las dos cosas.</div>
      </div>

    </div>
  );
}
