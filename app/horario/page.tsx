"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Wifi, WifiOff, AlertTriangle, Clock, ChevronRight } from "lucide-react";
import { WEEK_SCHEDULE, DAYS, ACTIVITY_PALETTE, HOUR_START, HOUR_END } from "@/data/schedule";
import { dayKeyOf, minutesOf } from "@/lib/schedule";
import { useCalendar } from "@/lib/useCalendar";
import { paletteFor, formatDuration, msUntil, analyzeDay, type CalEvent } from "@/lib/calendar";
import type { DayKey, ScheduleBlock } from "@/types";

const ROW_H       = 64;
const TOTAL_HOURS = HOUR_END - HOUR_START;
const GRID_H      = TOTAL_HOURS * ROW_H;

function positionTop(hhmm: string): number {
  const m = minutesOf(hhmm) - HOUR_START * 60;
  return Math.max(0, (m / (TOTAL_HOURS * 60)) * GRID_H);
}

function positionTopMs(date: Date): number {
  const m = date.getHours() * 60 + date.getMinutes() - HOUR_START * 60;
  return Math.max(0, (m / (TOTAL_HOURS * 60)) * GRID_H);
}

// ────────────────────────────────────────────────────────────
// NOW INDICATOR
// ────────────────────────────────────────────────────────────
function NowIndicator({ top }: { top: number }) {
  return (
    <div className="pointer-events-none absolute left-0 right-0 z-20" style={{ top }}>
      <div className="flex items-center gap-1">
        <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,230,255,0.8)]" />
        <div className="flex-1 border-t border-cyan-400/50" style={{ boxShadow: "0 0 6px rgba(34,230,255,0.3)" }} />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// CALENDAR BLOCK
// ────────────────────────────────────────────────────────────
function CalBlock({ event, isActive }: { event: CalEvent; isActive: boolean }) {
  const top    = positionTopMs(event.start);
  const bottom = positionTopMs(event.end);
  const height = Math.max(22, bottom - top - 2);
  const pal    = paletteFor(event.category);

  const startStr = event.start.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
  const endStr   = event.end.toLocaleTimeString("es-PE",   { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute left-0.5 right-0.5 overflow-hidden rounded-lg border transition-all cursor-default"
      style={{
        top, height,
        background:  isActive ? `${pal.bg}` : pal.bg,
        borderColor: isActive ? pal.color   : pal.border,
        boxShadow:   isActive ? `0 0 14px ${pal.color}55, inset 0 0 10px ${pal.color}0a` : "none",
        zIndex: isActive ? 10 : 2,
      }}
      title={`${startStr}–${endStr} · ${event.title}`}
    >
      {/* barra lateral activa */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
          style={{ background: pal.color, boxShadow: `0 0 6px ${pal.color}` }} />
      )}

      <div className="flex h-full flex-col px-2 py-1 pl-2.5">
        {/* Título — siempre visible */}
        <div
          className="truncate font-semibold leading-snug"
          style={{
            color:    pal.text,
            fontSize: height < 36 ? "10px" : "11px",
          }}
        >
          {event.title}
        </div>

        {/* Hora — si hay espacio */}
        {height >= 36 && (
          <div className="mt-0.5 font-mono text-[10px] tabular-nums" style={{ color: pal.color, opacity: 0.8 }}>
            {startStr}–{endStr}
          </div>
        )}

        {/* Badge AHORA */}
        {isActive && height >= 52 && (
          <div className="mt-auto self-start rounded-sm px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest"
            style={{ background: `${pal.color}22`, color: pal.color }}>
            AHORA
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────
// SCHEDULE BLOCK (hardcoded de fondo)
// ────────────────────────────────────────────────────────────
function ScheduleBlock({ block, isCurrent }: { block: ScheduleBlock; isCurrent: boolean }) {
  const top    = positionTop(block.start);
  const bottom = positionTop(block.end);
  const height = Math.max(16, bottom - top - 2);
  const p      = ACTIVITY_PALETTE[block.kind];

  // Bloques de fondo muy sutiles — no compiten con eventos reales
  return (
    <div
      className="absolute left-0 right-0 overflow-hidden"
      style={{ top, height, zIndex: 1 }}
      title={`${block.start}–${block.end} · ${block.label}`}
    >
      {/* Solo una línea de color muy sutil en el borde izquierdo */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[2px]"
        style={{ background: p.color, opacity: isCurrent ? 0.25 : 0.08 }}
      />
      {/* Texto extremadamente sutil */}
      {height >= 32 && (
        <div
          className="absolute left-3 top-1 truncate text-[9px] font-medium"
          style={{ color: p.text, opacity: isCurrent ? 0.18 : 0.08 }}
        >
          {block.label}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// DAY COLUMN
// ────────────────────────────────────────────────────────────
function DayColumn({
  dayKey, isToday, nowTop, calEvents, scheduleBlocks, currentEventId,
}: {
  dayKey: DayKey;
  isToday: boolean;
  nowTop: number | null;
  calEvents: CalEvent[];
  scheduleBlocks: ScheduleBlock[];
  currentEventId: string | null;
}) {
  return (
    <div className={`relative border-r border-white/[0.03] ${isToday ? "bg-cyan-400/[0.012]" : ""}`} style={{ height: GRID_H }}>
      {/* Líneas horizontales por hora */}
      {Array.from({ length: TOTAL_HOURS }, (_, i) => (
        <div
          key={i}
          className="absolute left-0 right-0 border-t border-white/[0.04]"
          style={{ top: i * ROW_H }}
        />
      ))}

      {/* Schedule base (guías de fondo) */}
      {scheduleBlocks.map((b, i) => {
        const mins   = minutesOf(b.start) - HOUR_START * 60;
        const nowMin = new Date().getHours() * 60 + new Date().getMinutes() - HOUR_START * 60;
        const isCur  = isToday && mins <= nowMin && (minutesOf(b.end) - HOUR_START * 60) > nowMin;
        return <ScheduleBlock key={i} block={b} isCurrent={isToday && isCur} />;
      })}

      {/* Calendar events (protagonistas) */}
      {calEvents.map(ev => (
        <CalBlock key={ev.id} event={ev} isActive={isToday && ev.id === currentEventId} />
      ))}

      {/* Now indicator */}
      {isToday && nowTop !== null && <NowIndicator top={nowTop} />}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// CURRENT EVENT CARD (top of page)
// ────────────────────────────────────────────────────────────
function CurrentEventCard({ event, now }: { event: CalEvent; now: Date }) {
  const remaining = msUntil(event.end, now);
  const total     = event.end.getTime() - event.start.getTime();
  const progress  = Math.max(0, Math.min(1, 1 - remaining / total));
  const pal       = paletteFor(event.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 overflow-hidden rounded-2xl border px-5 py-4"
      style={{ borderColor: `${pal.color}40`, background: pal.bg }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: pal.color }}>
            Ahora
          </div>
          <div className="mt-1 text-base font-bold text-white">{event.title}</div>
          <div className="mt-0.5 text-[11px] text-slate-400">
            {event.start.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}–
            {event.end.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
            {" · "}Termina en {formatDuration(remaining)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black tabular-nums" style={{ color: pal.color }}>
            {Math.round(progress * 100)}%
          </div>
          <div className="text-[10px] text-slate-500">completado</div>
        </div>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: pal.color, boxShadow: `0 0 8px ${pal.color}` }}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────
// DAY ANALYSIS BANNER
// ────────────────────────────────────────────────────────────
function DayAnalysisBanner({ events }: { events: CalEvent[] }) {
  const analysis = useMemo(() => analyzeDay(events), [events]);
  if (!analysis.overloaded && !analysis.endsLate) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-4 flex items-start gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/[0.04] px-4 py-3"
    >
      <AlertTriangle size={14} className="mt-0.5 shrink-0 text-yellow-400" />
      <div className="text-xs text-slate-300">
        {analysis.overloaded && "Día sobrecargado. "}
        {analysis.endsLate && "Actividades hasta tarde. "}
        Considera reducir carga o activar Recovery Mode.
      </div>
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────────────────────

export default function HorarioPage() {
  const [now, setNow] = useState(new Date());
  const cal = useCalendar();

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const todayKey = dayKeyOf(now) as DayKey;
  const nowTop   = positionTopMs(now);

  const eventsByDay = useMemo(() => {
    const map: Partial<Record<DayKey, CalEvent[]>> = {};
    for (const day of DAYS) {
      // Calcular fecha de ese día en la semana actual
      const d = new Date(now);
      const currDow = d.getDay(); // 0=dom
      const targetDow = ["dom","lun","mar","mie","jue","vie","sab"].indexOf(day.key);
      const diff = targetDow - currDow;
      d.setDate(d.getDate() + diff);
      d.setHours(0, 0, 0, 0);
      const nextDay = new Date(d);
      nextDay.setDate(d.getDate() + 1);
      map[day.key] = cal.events.filter(e => e.start >= d && e.start < nextDay);
    }
    return map;
  }, [cal.events, now]);

  return (
    <div className="flex h-full flex-col px-3 py-4 sm:px-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white">Mission Control</h1>
          <p className="text-[11px] text-slate-500">
            {now.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })}
            {" · "}
            {now.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {cal.error ? (
            <span title="Sin datos del calendario" className="flex items-center gap-1 text-[10px] text-yellow-400">
              <WifiOff size={12} /> Offline
            </span>
          ) : cal.loading ? (
            <span className="text-[10px] text-slate-600">Sincronizando…</span>
          ) : (
            <span title="Calendario sincronizado" className="flex items-center gap-1 text-[10px] text-slate-600">
              <Wifi size={11} className="text-cyan-500" />
              {cal.lastFetched?.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={cal.refresh}
            disabled={cal.loading}
            className="rounded-lg border border-white/[0.06] p-1.5 text-slate-500 transition-all hover:text-slate-300 disabled:opacity-30"
          >
            <RefreshCw size={13} className={cal.loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Current event */}
      <AnimatePresence>
        {cal.current && <CurrentEventCard event={cal.current} now={now} />}
      </AnimatePresence>

      {/* Day analysis */}
      <DayAnalysisBanner events={eventsByDay[todayKey] ?? []} />

      {/* Next event (si no hay current) */}
      {!cal.current && cal.next && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <Clock size={13} className="text-slate-500" />
          <div className="flex-1 text-xs text-slate-400">
            Próximo: <span className="text-slate-200 font-medium">{cal.next.title}</span>
            {" · en "}
            <span className="text-cyan-400">{formatDuration(msUntil(cal.next.start, now))}</span>
          </div>
          <ChevronRight size={13} className="text-slate-600" />
        </div>
      )}

      {/* Timeline grid */}
      <div className="flex-1 overflow-auto rounded-2xl border border-white/[0.04]">
        {/* Day headers */}
        <div className="sticky top-0 z-30 flex border-b border-white/[0.04] bg-[#070b12]">
          <div className="w-12 shrink-0 border-r border-white/[0.04]" />
          {DAYS.map(d => (
            <div
              key={d.key}
              className={`flex-1 border-r border-white/[0.04] py-2 text-center last:border-r-0 ${d.key === todayKey ? "bg-cyan-400/[0.04]" : ""}`}
            >
              <div className={`text-[10px] font-bold uppercase tracking-widest ${d.key === todayKey ? "text-cyan-400" : "text-slate-600"}`}>
                {d.short}
              </div>
              <div className={`text-[10px] ${d.key === todayKey ? "text-slate-300" : "text-slate-700"}`}>
                {d.label.slice(0, 3)}
              </div>
              {(eventsByDay[d.key]?.length ?? 0) > 0 && (
                <div className="mx-auto mt-1 h-1 w-1 rounded-full bg-cyan-400/50" />
              )}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex">
        {/* Hour labels */}
          <div className="relative w-12 shrink-0 border-r border-white/[0.04]" style={{ height: GRID_H }}>
            {Array.from({ length: TOTAL_HOURS }, (_, i) => (
              <div key={i} style={{ position: "absolute", top: i * ROW_H, left: 0, right: 0 }}>
                <div className="pr-2 text-right font-mono text-[10px] text-slate-600 leading-none" style={{ marginTop: -6 }}>
                  {String(HOUR_START + i).padStart(2, "0")}
                </div>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {DAYS.map(d => (
            <div key={d.key} className="min-w-0 flex-1">
              <DayColumn
                dayKey={d.key}
                isToday={d.key === todayKey}
                nowTop={d.key === todayKey ? nowTop : null}
                calEvents={eventsByDay[d.key] ?? []}
                scheduleBlocks={WEEK_SCHEDULE[d.key] ?? []}
                currentEventId={cal.current?.id ?? null}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3">
        {[
          { color: "#22d3a5", label: "Gym" },
          { color: "#22e6ff", label: "Meeting" },
          { color: "#fbbf24", label: "Clases" },
          { color: "#a78bfa", label: "Proyectos" },
          { color: "#2dd4bf", label: "Comercial" },
          { color: "#7c93b8", label: "Trabajo" },
        ].map(i => (
          <div key={i.label} className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full" style={{ background: i.color }} />
            <span className="text-[10px] text-slate-600">{i.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="h-px w-4 bg-cyan-400/50" />
          <span className="text-[10px] text-slate-600">Ahora</span>
        </div>
      </div>
    </div>
  );
}
