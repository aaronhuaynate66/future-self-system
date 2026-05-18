// ============================================================
// AARON OS v2 — Calendar parser (Outlook ICS → CalEvent[])
// Timezone: America/Lima (GMT-5, sin DST)
// ============================================================

"use client";

// Importamos ical.js dinámicamente para evitar problemas SSR
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ICAL: any = null;

async function getICAL() {
  if (!ICAL) {
    const mod = await import("ical.js");
    // ical.js puede exportar como default namespace o como named exports
    ICAL = (mod as any).default ?? mod;
  }
  return ICAL;
}

// ────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────

export interface CalEvent {
  id: string;
  title: string;
  start: Date;        // hora local Lima
  end: Date;
  allDay: boolean;
  location?: string;
  description?: string;
  category: CalCategory;
  color: string;
  textColor: string;
  recurrent: boolean;
}

export type CalCategory =
  | "gym"
  | "work"
  | "classes"
  | "meeting"
  | "personal"
  | "health"
  | "finance"
  | "review"
  | "other";

// ────────────────────────────────────────────────────────────
// CATEGORY DETECTION
// ────────────────────────────────────────────────────────────

const CATEGORY_RULES: { pattern: RegExp; cat: CalCategory }[] = [
  { pattern: /gym|entrena|ejercicio|workout|fuerza|cardio/i,  cat: "gym"      },
  { pattern: /clase|class|alumno|docente|enseñ|curso/i,       cat: "classes"  },
  { pattern: /reuni[oó]n|meeting|call|sync|standup|zoom|teams/i, cat: "meeting" },
  { pattern: /weekly.?review|review|retrospectiva/i,          cat: "review"   },
  { pattern: /m[eé]dico|doctor|cita|salud|health/i,           cat: "health"   },
  { pattern: /banco|pago|factura|finanz|invoice|cobro/i,      cat: "finance"  },
  { pattern: /cumplea|cumple|familia|pareja|perro/i,           cat: "personal" },
  { pattern: /trabajo|work|proyecto|sprint|entrega|deadline/i, cat: "work"    },
];

const CATEGORY_PALETTE: Record<CalCategory, { color: string; bg: string; border: string; text: string; solid: string }> = {
  // solid = color de fondo sólido estilo Outlook
  gym:      { color: "#10b981", bg: "rgba(16,185,129,0.18)",  border: "rgba(16,185,129,0.50)",  text: "#ffffff", solid: "#065f46" },
  work:     { color: "#3b82f6", bg: "rgba(59,130,246,0.18)",  border: "rgba(59,130,246,0.50)",  text: "#ffffff", solid: "#1e3a5f" },
  classes:  { color: "#f59e0b", bg: "rgba(245,158,11,0.18)",  border: "rgba(245,158,11,0.55)",  text: "#ffffff", solid: "#78350f" },
  meeting:  { color: "#6366f1", bg: "rgba(99,102,241,0.18)",  border: "rgba(99,102,241,0.50)",  text: "#ffffff", solid: "#312e81" },
  personal: { color: "#ec4899", bg: "rgba(236,72,153,0.15)",  border: "rgba(236,72,153,0.45)",  text: "#ffffff", solid: "#831843" },
  health:   { color: "#ef4444", bg: "rgba(239,68,68,0.15)",   border: "rgba(239,68,68,0.45)",   text: "#ffffff", solid: "#7f1d1d" },
  finance:  { color: "#14b8a6", bg: "rgba(20,184,166,0.15)",  border: "rgba(20,184,166,0.45)",  text: "#ffffff", solid: "#134e4a" },
  review:   { color: "#8b5cf6", bg: "rgba(139,92,246,0.18)",  border: "rgba(139,92,246,0.55)",  text: "#ffffff", solid: "#4c1d95" },
  other:    { color: "#64748b", bg: "rgba(100,116,139,0.15)", border: "rgba(100,116,139,0.40)", text: "#e2e8f0", solid: "#1e293b" },
};

function detectCategory(title: string, description?: string): CalCategory {
  const text = `${title} ${description ?? ""}`;
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(text)) return rule.cat;
  }
  return "other";
}

export function paletteFor(cat: CalCategory): { color: string; bg: string; border: string; text: string; solid: string } {
  return CATEGORY_PALETTE[cat];
}

// ────────────────────────────────────────────────────────────
// TIMEZONE HELPERS  (Lima GMT-5, no DST)
// ────────────────────────────────────────────────────────────

const LIMA_OFFSET_MS = -5 * 60 * 60 * 1000;

function toUtcMs(icalTime: { toJSDate: () => Date; isDate?: boolean; zone?: { tzid?: string } }): number {
  const jsDate = icalTime.toJSDate();
  const tzid = icalTime.zone?.tzid ?? "";

  // Si ya viene como UTC o floating, ajustamos a Lima
  if (!tzid || tzid === "UTC" || tzid === "floating") {
    return jsDate.getTime() + LIMA_OFFSET_MS;
  }

  // Si ya viene en Lima, lo usamos tal cual
  if (tzid.includes("Lima") || tzid.includes("Peru") || tzid.includes("Bogota")) {
    return jsDate.getTime();
  }

  // Fallback: respetar lo que devuelve ical.js (ya debería ser UTC correcto)
  return jsDate.getTime();
}

function icalTimeToLocal(icalTime: { toJSDate: () => Date; isDate?: boolean; zone?: { tzid?: string } }): Date {
  return new Date(toUtcMs(icalTime));
}

// ────────────────────────────────────────────────────────────
// ICS PARSER
// ────────────────────────────────────────────────────────────

export async function parseICS(icsText: string): Promise<CalEvent[]> {
  const ical = await getICAL();
  const parsed = ical.parse(icsText);
  const comp = new ical.Component(parsed);
  const vevents = comp.getAllSubcomponents("vevent");

  const now = new Date();
  const windowStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const windowEnd   = new Date(now.getFullYear(), now.getMonth() + 3, 1);

  const events: CalEvent[] = [];

  for (const vevent of vevents) {
    try {
      const event = new ical.Event(vevent);
      const title = event.summary ?? "Sin título";
      const desc  = event.description ?? "";
      const loc   = event.location ?? "";
      const cat   = detectCategory(title, desc);
      const pal   = CATEGORY_PALETTE[cat];

      if (event.isRecurring()) {
        // Expandir recurrencias en la ventana
        const iter = event.iterator();
        let next;
        let safetyLimit = 500;

        while ((next = iter.next()) && safetyLimit-- > 0) {
          const startDate = icalTimeToLocal(next);
          if (startDate > windowEnd) break;
          if (startDate < windowStart) continue;

          const dur = event.duration;
          const endDate = new Date(startDate.getTime() + (dur ? dur.toSeconds() * 1000 : 60 * 60 * 1000));

          events.push({
            id: `${event.uid}-${startDate.getTime()}`,
            title,
            start: startDate,
            end: endDate,
            allDay: next.isDate ?? false,
            location: loc || undefined,
            description: desc || undefined,
            category: cat,
            color: pal.color,
            textColor: pal.text,
            recurrent: true,
          });
        }
      } else {
        const startDate = icalTimeToLocal(event.startDate);
        const endDate   = icalTimeToLocal(event.endDate);

        if (startDate > windowEnd || endDate < windowStart) continue;

        events.push({
          id: event.uid ?? `ev-${startDate.getTime()}`,
          title,
          start: startDate,
          end: endDate,
          allDay: event.startDate.isDate ?? false,
          location: loc || undefined,
          description: desc || undefined,
          category: cat,
          color: pal.color,
          textColor: pal.text,
          recurrent: false,
        });
      }
    } catch {
      // Ignorar eventos malformados
    }
  }

  return events.sort((a, b) => a.start.getTime() - b.start.getTime());
}

// ────────────────────────────────────────────────────────────
// FETCH + CACHE
// ────────────────────────────────────────────────────────────

const CACHE_KEY    = "aaron_calendar_cache";
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutos

interface CacheEntry {
  events: { id: string; title: string; start: string; end: string; allDay: boolean; location?: string; description?: string; category: CalCategory; color: string; textColor: string; recurrent: boolean }[];
  fetchedAt: number;
}

export async function fetchCalendarEvents(forceRefresh = false): Promise<CalEvent[]> {
  // Intentar caché
  if (!forceRefresh && typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cache: CacheEntry = JSON.parse(raw);
        if (Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
          return cache.events.map(e => ({
            ...e,
            start: new Date(e.start),
            end: new Date(e.end),
          }));
        }
      }
    } catch {}
  }

  // Fetch fresco via proxy API
  const res = await fetch("/api/calendar", { cache: "no-store" });
  if (!res.ok) throw new Error(`Calendar fetch failed: ${res.status}`);

  const text = await res.text();
  const events = await parseICS(text);

  // Guardar caché
  if (typeof window !== "undefined") {
    try {
      const entry: CacheEntry = {
        fetchedAt: Date.now(),
        events: events.map(e => ({
          ...e,
          start: e.start.toISOString(),
          end: e.end.toISOString(),
        })),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    } catch {}
  }

  return events;
}

// ────────────────────────────────────────────────────────────
// HELPERS DE VISTA
// ────────────────────────────────────────────────────────────

export function eventsForDate(events: CalEvent[], date: Date): CalEvent[] {
  const d = date.toDateString();
  return events.filter(e => e.start.toDateString() === d);
}

export function currentEvent(events: CalEvent[], now = new Date()): CalEvent | null {
  return events.find(e => e.start <= now && e.end > now) ?? null;
}

export function nextEvent(events: CalEvent[], now = new Date()): CalEvent | null {
  return events.find(e => e.start > now) ?? null;
}

export function msUntil(date: Date, now = new Date()): number {
  return Math.max(0, date.getTime() - now.getTime());
}

export function formatDuration(ms: number): string {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// Detectar sobrecarga del día
export interface DayAnalysis {
  totalEventMinutes: number;
  hasGym: boolean;
  hasMeeting: boolean;
  hasClasses: boolean;
  endsLate: boolean;     // último evento termina después de las 22:00
  overloaded: boolean;   // >10h de eventos
  recoveryNeeded: boolean;
}

export function analyzeDay(events: CalEvent[]): DayAnalysis {
  const totalEventMinutes = events.reduce((acc, e) => {
    const dur = (e.end.getTime() - e.start.getTime()) / 60000;
    return acc + dur;
  }, 0);

  const lastEnd = events.length > 0
    ? Math.max(...events.map(e => e.end.getHours() * 60 + e.end.getMinutes()))
    : 0;

  const overloaded = totalEventMinutes > 10 * 60;
  const endsLate   = lastEnd > 22 * 60;

  return {
    totalEventMinutes,
    hasGym:      events.some(e => e.category === "gym"),
    hasMeeting:  events.some(e => e.category === "meeting"),
    hasClasses:  events.some(e => e.category === "classes"),
    endsLate,
    overloaded,
    recoveryNeeded: overloaded || endsLate,
  };
}
