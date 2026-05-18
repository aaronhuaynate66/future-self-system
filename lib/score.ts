import type { DailyLog, Tier, WeekScore, SystemMode } from "@/types";
import { RECOVERY_THRESHOLD } from "@/data/rules";

const WEIGHTS = {
  trained: 25,
  checkedDashboard: 20,
  commercialMove: 20,
  peace: 20,
  sleep: 15,
} as const;

export function scoreDay(log: DailyLog): number {
  let score = 0;
  if (log.trained) score += WEIGHTS.trained;
  if (log.checkedDashboard) score += WEIGHTS.checkedDashboard;
  if (log.commercialMove) score += WEIGHTS.commercialMove;
  score += peaceToScore(log.peace) * WEIGHTS.peace;
  score += sleepToScore(log.sleep) * WEIGHTS.sleep;
  return Math.round(score);
}

function peaceToScore(p: DailyLog["peace"]): number {
  if (p === "verde") return 1;
  if (p === "amarillo") return 0.5;
  return 0;
}

function sleepToScore(s: DailyLog["sleep"]): number {
  if (s === "bien") return 1;
  if (s === "regular") return 0.5;
  return 0;
}

export function tierOf(score: number): Tier {
  if (score >= 90) return "S";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  return "D";
}

export const TIER_META: Record<Tier, { label: string; range: string; color: string; description: string }> = {
  S: { label: "S TIER", range: "90–100", color: "#22e6ff", description: "Sistema operando al máximo." },
  A: { label: "A TIER", range: "80–89", color: "#22d3a5", description: "Alto rendimiento sostenido." },
  B: { label: "B TIER", range: "70–79", color: "#7df3ff", description: "Funcionando bien, hay margen." },
  C: { label: "C TIER", range: "60–69", color: "#fbbf24", description: "Atención requerida. Ajustar." },
  D: { label: "D TIER", range: "<60",   color: "#f43f5e", description: "Sistema degradado. Recuperar." },
};

export function weekBounds(date: Date | string): { start: string; end: string } {
  const d = typeof date === "string" ? new Date(date + "T12:00:00") : new Date(date);
  const day = d.getDay();
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: monday.toISOString().slice(0, 10),
    end: sunday.toISOString().slice(0, 10),
  };
}

export function summarizeWeek(logs: DailyLog[], reference: Date | string): WeekScore {
  const { start, end } = weekBounds(reference);
  const week = logs.filter((l) => l.date >= start && l.date <= end);

  const score =
    week.length === 0
      ? 0
      : Math.round(week.reduce((s, l) => s + scoreDay(l), 0) / week.length);

  const tier = tierOf(score);

  const breakdown = {
    trained: week.filter((l) => l.trained).length,
    checkedDashboard: week.filter((l) => l.checkedDashboard).length,
    commercialMove: week.filter((l) => l.commercialMove).length,
    peaceVerde: week.filter((l) => l.peace === "verde").length,
    sleepBien: week.filter((l) => l.sleep === "bien").length,
    migraines: week.filter((l) => l.migraine).length,
    arguments: week.filter((l) => l.argued).length,
  };

  const alerts: string[] = [];
  if (week.length >= 3) {
    if (breakdown.trained / week.length < 0.4)
      alerts.push("Entrenamientos por debajo del 40%.");
    if (breakdown.peaceVerde / week.length < 0.4)
      alerts.push("Paz mental en riesgo. Reducir ruido.");
    if (breakdown.sleepBien / week.length < 0.4)
      alerts.push("Sueño deteriorado. Prioritizar descanso.");
    if (breakdown.migraines >= 2)
      alerts.push(`${breakdown.migraines} migrañas esta semana.`);
    if (breakdown.commercialMove === 0)
      alerts.push("Sin movimiento comercial. Activar pipeline.");
  }

  return { weekStart: start, weekEnd: end, days: week, score, tier, alerts, breakdown, daysLogged: week.length };
}

// Recovery Mode
export function getSystemMode(score: number): SystemMode {
  return score <= RECOVERY_THRESHOLD ? "RECOVERY" : "NORMAL";
}
