export const FUTURE_SELF_RULES: { id: string; text: string }[] = [
  { id: "r1", text: "No gastar energía en discusiones tontas." },
  { id: "r2", text: "No alimentar pensamientos negativos innecesarios." },
  { id: "r3", text: "Menos abrir cosas nuevas. Más hacer funcionar lo que ya existe." },
  { id: "r4", text: "La paz mental es infraestructura de rendimiento." },
  { id: "r5", text: "Lo importante debe volverse visible." },
  { id: "r6", text: "Cágala más rápido para corregir más rápido." },
];

export const MISSION = "Conseguir paz.";
export const MISSION_SUB = "Menos ruido. Más enfoque. Más estructura.";

export const PLAN_START = "2026-06-01";
export const PLAN_END = "2026-08-31";
export const WORLDS_DATE = "2026-11-01";

// Umbral de score para activar Recovery Mode
export const RECOVERY_THRESHOLD = 45;

// Fechas de control del plan 90 días
export const CONTROL_DATES: { date: string; label: string; detail: string; kind: "pilot" | "start" | "review" | "close" | "worlds" }[] = [
  { date: "2026-05-20", label: "Weekly Review piloto",    detail: "Miércoles 20 mayo · 7:30 p.m.",    kind: "pilot"  },
  { date: "2026-05-31", label: "Preparación final",       detail: "Domingo 31 mayo · 5:00 p.m.",      kind: "pilot"  },
  { date: "2026-06-01", label: "Inicio oficial Aaron OS", detail: "Lunes 1 junio · 8:30 a.m.",        kind: "start"  },
  { date: "2026-06-03", label: "Primer Weekly Review",    detail: "Miércoles 3 junio · 7:30 p.m.",    kind: "review" },
  { date: "2026-06-30", label: "Cierre de estabilización",detail: "Martes 30 junio · 8:00 p.m.",      kind: "close"  },
  { date: "2026-07-31", label: "Cierre de consistencia",  detail: "Viernes 31 julio · 8:00 p.m.",     kind: "close"  },
  { date: "2026-08-31", label: "Evaluación final 90 días",detail: "Lunes 31 agosto · 8:00 p.m.",      kind: "close"  },
  { date: "2026-11-01", label: "Mundial de Bomberos",     detail: "Noviembre 2026",                   kind: "worlds" },
];

// No negociables del sistema
export const NON_NEGOTIABLES = [
  "Gym mínimo 3x semana.",
  "Daily Check 8:30 a.m.",
  "Weekly Review miércoles 7:30 p.m.",
  "Movimiento comercial semanal.",
];
