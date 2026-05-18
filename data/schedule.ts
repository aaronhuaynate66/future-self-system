import type { WeekSchedule, DayKey, ActivityKind } from "@/types";

export const WEEK_SCHEDULE: WeekSchedule = {
  lun: [
    { start: "06:00", end: "06:30", kind: "wake", label: "Despertar", detail: "Agua, no redes" },
    { start: "06:30", end: "07:00", kind: "transition", label: "Preparar gym" },
    { start: "07:00", end: "08:00", kind: "gym", label: "Gym" },
    { start: "08:00", end: "08:30", kind: "transition", label: "Ducha + desayuno" },
    { start: "08:30", end: "08:35", kind: "check", label: "Daily System Check" },
    { start: "09:00", end: "18:00", kind: "work", label: "Trabajo" },
    { start: "18:30", end: "19:30", kind: "projects", label: "SIR / proyectos" },
    { start: "22:30", end: "23:00", kind: "sleep", label: "Dormir" },
  ],
  mar: [
    { start: "06:30", end: "07:00", kind: "wake", label: "Despertar" },
    { start: "07:00", end: "08:00", kind: "gym", label: "Gym opcional", detail: "o movilidad" },
    { start: "08:30", end: "08:35", kind: "check", label: "Daily System Check" },
    { start: "09:00", end: "17:00", kind: "work", label: "Trabajo" },
    { start: "17:00", end: "18:00", kind: "commute", label: "Traslado a clases" },
    { start: "18:00", end: "21:00", kind: "classes", label: "Clases" },
    { start: "22:00", end: "23:59", kind: "sleep", label: "Llegada, ducha, dormir" },
  ],
  mie: [
    { start: "06:00", end: "06:30", kind: "wake", label: "Despertar" },
    { start: "07:00", end: "08:00", kind: "gym", label: "Gym" },
    { start: "08:30", end: "08:35", kind: "check", label: "Daily System Check" },
    { start: "09:00", end: "18:00", kind: "work", label: "Trabajo" },
    { start: "18:30", end: "19:30", kind: "projects", label: "Proyectos / ajustes" },
    { start: "19:30", end: "20:30", kind: "review", label: "Weekly Review" },
    { start: "22:30", end: "23:00", kind: "sleep", label: "Dormir" },
  ],
  jue: [
    { start: "06:30", end: "07:00", kind: "wake", label: "Despertar" },
    { start: "07:00", end: "08:00", kind: "gym", label: "Gym opcional", detail: "o movilidad" },
    { start: "08:30", end: "08:35", kind: "check", label: "Daily System Check" },
    { start: "09:00", end: "17:00", kind: "work", label: "Trabajo" },
    { start: "17:00", end: "18:00", kind: "commute", label: "Traslado a clases" },
    { start: "18:00", end: "21:00", kind: "classes", label: "Clases" },
    { start: "22:00", end: "23:59", kind: "sleep", label: "Llegada, ducha, dormir" },
  ],
  vie: [
    { start: "06:00", end: "06:30", kind: "wake", label: "Despertar" },
    { start: "07:00", end: "08:00", kind: "gym", label: "Gym" },
    { start: "08:30", end: "08:35", kind: "check", label: "Daily System Check" },
    { start: "09:00", end: "18:00", kind: "work", label: "Trabajo" },
    { start: "18:00", end: "19:00", kind: "commercial", label: "Comercial / prospectos" },
    { start: "19:30", end: "21:30", kind: "rest", label: "Descanso" },
    { start: "23:00", end: "23:30", kind: "sleep", label: "Dormir máximo" },
  ],
  sab: [
    { start: "08:00", end: "09:00", kind: "wake", label: "Despertar lento" },
    { start: "09:30", end: "10:30", kind: "gym", label: "Gym o actividad física" },
    { start: "11:00", end: "13:00", kind: "deep", label: "Bloque profundo" },
    { start: "15:00", end: "19:00", kind: "rest", label: "Pareja / perro / caminar" },
    { start: "23:00", end: "23:30", kind: "sleep", label: "Dormir máximo" },
  ],
  dom: [
    { start: "08:30", end: "09:30", kind: "wake", label: "Despertar tranquilo" },
    { start: "10:00", end: "11:00", kind: "rest", label: "Caminar / perro" },
    { start: "17:00", end: "17:30", kind: "shutdown", label: "Preparar semana" },
    { start: "20:30", end: "21:00", kind: "shutdown", label: "Shutdown" },
    { start: "22:30", end: "23:00", kind: "sleep", label: "Dormir" },
  ],
};

export const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: "lun", label: "Lunes",     short: "L" },
  { key: "mar", label: "Martes",    short: "M" },
  { key: "mie", label: "Miércoles", short: "X" },
  { key: "jue", label: "Jueves",    short: "J" },
  { key: "vie", label: "Viernes",   short: "V" },
  { key: "sab", label: "Sábado",    short: "S" },
  { key: "dom", label: "Domingo",   short: "D" },
];

export const ACTIVITY_PALETTE: Record<
  ActivityKind,
  { label: string; color: string; bg: string; border: string; text: string }
> = {
  wake:       { label: "Despertar",  color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.25)", text: "#cbd5e1" },
  gym:        { label: "Gym",        color: "#22d3a5", bg: "rgba(34,211,165,0.10)", border: "rgba(34,211,165,0.35)", text: "#6ee7b7" },
  transition: { label: "Transición", color: "#64748b", bg: "rgba(100,116,139,0.06)", border: "rgba(100,116,139,0.20)", text: "#94a3b8" },
  check:      { label: "Check",      color: "#22e6ff", bg: "rgba(34,230,255,0.10)", border: "rgba(34,230,255,0.35)", text: "#7df3ff" },
  work:       { label: "Trabajo",    color: "#7c93b8", bg: "rgba(99,124,165,0.10)", border: "rgba(99,124,165,0.30)", text: "#a8bbd6" },
  commute:    { label: "Traslado",   color: "#64748b", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.25)", text: "#94a3b8" },
  classes:    { label: "Clases",     color: "#fbbf24", bg: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.35)", text: "#fde68a" },
  projects:   { label: "Proyectos",  color: "#a78bfa", bg: "rgba(167,139,250,0.10)", border: "rgba(167,139,250,0.35)", text: "#c4b5fd" },
  commercial: { label: "Comercial",  color: "#2dd4bf", bg: "rgba(45,212,191,0.10)", border: "rgba(45,212,191,0.35)", text: "#99f6e4" },
  deep:       { label: "Profundo",   color: "#7df3ff", bg: "rgba(125,243,255,0.08)", border: "rgba(125,243,255,0.30)", text: "#aef2ff" },
  rest:       { label: "Descanso",   color: "#64748b", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.22)", text: "#94a3b8" },
  review:     { label: "Review",     color: "#22e6ff", bg: "rgba(34,230,255,0.10)", border: "rgba(34,230,255,0.40)", text: "#7df3ff" },
  shutdown:   { label: "Shutdown",   color: "#7df3ff", bg: "rgba(125,243,255,0.06)", border: "rgba(125,243,255,0.25)", text: "#aef2ff" },
  sleep:      { label: "Dormir",     color: "#334155", bg: "rgba(30,41,59,0.40)", border: "rgba(51,65,85,0.35)", text: "#64748b" },
};

export const HOUR_START = 6;
export const HOUR_END = 24;
