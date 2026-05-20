// ============================================================
// AARON OS v2 — Identidad operativa real
// Basado en: Future Self System Diagnóstico Inicial
// ============================================================

export const MISSION     = "Conseguir paz.";
export const MISSION_SUB = "Menos ruido. Más enfoque. Más estructura.";

// ── Reglas del Yo Futuro ──────────────────────────────────────
export const FUTURE_SELF_RULES: { id: string; text: string }[] = [
  { id: "r1",  text: "No gastar energía en discusiones tontas." },
  { id: "r2",  text: "No alimentar pensamientos negativos innecesarios." },
  { id: "r3",  text: "Menos abrir cosas nuevas. Más hacer funcionar lo que ya existe." },
  { id: "r4",  text: "La paz mental es infraestructura de rendimiento." },
  { id: "r5",  text: "Lo importante debe volverse visible." },
  { id: "r6",  text: "Cágala más rápido para corregir más rápido." },
  { id: "r7",  text: "No todo merece mi energía." },
  { id: "r8",  text: "No todo se puede cargar al mismo tiempo." },
  { id: "r9",  text: "La energía mental es extremadamente valiosa — protegerla es prioritario." },
  { id: "r10", text: "La claridad aparece más por movimiento que por sobreanálisis." },
  { id: "r11", text: "La paz es prioridad estratégica, no un lujo." },
  { id: "r12", text: "No tolerar relaciones que no suman." },
];

// ── Lo que el Yo Futuro dejó de tolerar ──────────────────────
export const STOPPED_TOLERATING = [
  "Sentirse mal por lo que digan otras personas.",
  "Relaciones que no suman.",
  "Discusiones tontas.",
  "Gastar energía innecesaria.",
  "Sobrecarga de frentes abiertos.",
  "Ruido emocional sostenido.",
];

// ── Bloqueos detectados ───────────────────────────────────────
export const DETECTED_BLOCKS = [
  "Falta de estructura comercial.",
  "No hacer outreach constante.",
  "Procrastinación.",
  "Ruido emocional.",
  "Sobrecarga mental.",
  "Demasiados frentes abiertos.",
];

// ── No negociables del sistema ────────────────────────────────
export const NON_NEGOTIABLES = [
  "Gym mínimo 3x semana.",
  "Daily Check 8:30 a.m.",
  "Weekly Review miércoles 7:30 p.m.",
  "Movimiento comercial mínimo 1 acción diaria.",
];

// ── Visión de vida ideal ──────────────────────────────────────
export const LIFE_VISION = [
  "Una casa grande con espacio verde.",
  "Mi perro.",
  "Una familia.",
  "Paz.",
  "Libertad.",
  "Estabilidad emocional.",
  "Poder aprender a volar un avión.",
];

// ── Frase central ─────────────────────────────────────────────
export const CORE_QUOTE = "Ser feliz y que nadie me joda.";

// ── Diagnóstico final ─────────────────────────────────────────
export const DIAGNOSIS = "Alta capacidad. Alta ambición. El cuello de botella es falta de estructura, enfoque sostenible y protección de energía mental.";

// ── Metas corto plazo (0–3 meses) ────────────────────────────
export const SHORT_TERM_GOALS = [
  "Ingresos de S/ 7,500 → S/ 15,000 mensuales.",
  "Un cliente recurrente que pague mínimo S/ 5,000/mes.",
  "Estabilidad emocional y claridad en la relación sentimental.",
];

// ── Metas mediano plazo (6–12 meses) ─────────────────────────
export const MID_TERM_GOALS = [
  "MarLab factura S/ 1 millón anual.",
  "Ganar el campeonato mundial de bomberos — noviembre 2026.",
  "Mudarse con el perro, salir de casa de mamá.",
];

// ── Plan temporal ─────────────────────────────────────────────
export const PLAN_START  = "2026-06-01";
export const PLAN_END    = "2026-08-31";
export const WORLDS_DATE = "2026-11-01";

// ── Datos financieros reales ──────────────────────────────────
export const INCOME_ACTUAL   = 6173.38;
export const INCOME_GOAL     = 15000;
export const CLIENT_GOAL     = 5000;
export const MARLAB_ANNUAL   = 1000000;

export const FIXED_EXPENSES = {
  terreno_empresa:  1120.86,
  terreno_personal:  656.25,
  seguro_pacifico:   847.06,
};

// ── Sistema ───────────────────────────────────────────────────
export const RECOVERY_THRESHOLD = 45;

export const CONTROL_DATES: {
  date: string; label: string; detail: string;
  kind: "pilot" | "start" | "review" | "close" | "worlds";
}[] = [
  { date: "2026-05-20", label: "Weekly Review piloto",     detail: "Miércoles 20 mayo · 7:30 p.m.",  kind: "pilot"  },
  { date: "2026-05-31", label: "Preparación final",        detail: "Domingo 31 mayo · 5:00 p.m.",    kind: "pilot"  },
  { date: "2026-06-01", label: "Inicio oficial Aaron OS",  detail: "Lunes 1 junio · 8:30 a.m.",      kind: "start"  },
  { date: "2026-06-03", label: "Primer Weekly Review",     detail: "Miércoles 3 junio · 7:30 p.m.",  kind: "review" },
  { date: "2026-06-30", label: "Cierre de estabilización", detail: "Martes 30 junio · 8:00 p.m.",    kind: "close"  },
  { date: "2026-07-31", label: "Cierre de consistencia",   detail: "Viernes 31 julio · 8:00 p.m.",   kind: "close"  },
  { date: "2026-08-31", label: "Evaluación final 90 días", detail: "Lunes 31 agosto · 8:00 p.m.",    kind: "close"  },
  { date: "2026-11-01", label: "Mundial de Bomberos",      detail: "Noviembre 2026",                  kind: "worlds" },
];
