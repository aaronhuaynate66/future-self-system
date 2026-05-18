import type { DailyLog, OperationalStatus } from "@/types";
import { scoreDay } from "@/lib/score";

export function statusFromLog(log: DailyLog | null): OperationalStatus {
  if (!log) return "OPERATIONAL";
  const s = scoreDay(log);
  const heat = log.migraine || log.argued || log.peace === "rojo";
  if (log.sleep === "mal" && log.peace === "rojo") return "REACTIVE";
  if (s < 40) return "REACTIVE";
  if (s < 60 || heat) return "UNSTABLE";
  if (s < 80) return "OPERATIONAL";
  if (s < 90) return "FOCUSED";
  return heat ? "FOCUSED" : "LOCKED_IN";
}

export interface StatusMeta {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  hint: string;
  glowClass: string;
}

export const STATUS_META: Record<OperationalStatus, StatusMeta> = {
  LOCKED_IN: {
    label: "LOCKED IN",
    color: "#22e6ff",
    bgColor: "rgba(34,230,255,0.06)",
    borderColor: "rgba(34,230,255,0.25)",
    hint: "Sistema sincronizado. Mantener el ritmo.",
    glowClass: "shadow-glow",
  },
  FOCUSED: {
    label: "FOCUSED",
    color: "#22d3a5",
    bgColor: "rgba(34,211,165,0.06)",
    borderColor: "rgba(34,211,165,0.25)",
    hint: "Buen día. Sostener la disciplina mínima.",
    glowClass: "shadow-glow-green",
  },
  OPERATIONAL: {
    label: "OPERATIONAL",
    color: "#7df3ff",
    bgColor: "rgba(125,243,255,0.04)",
    borderColor: "rgba(125,243,255,0.20)",
    hint: "Funcionando. Identificar el siguiente movimiento.",
    glowClass: "shadow-glow-sm",
  },
  UNSTABLE: {
    label: "UNSTABLE",
    color: "#fbbf24",
    bgColor: "rgba(251,191,36,0.05)",
    borderColor: "rgba(251,191,36,0.22)",
    hint: "Hay ruido. Reducir, no abrir más cosas.",
    glowClass: "shadow-glow-amber",
  },
  REACTIVE: {
    label: "REACTIVE",
    color: "#f43f5e",
    bgColor: "rgba(244,63,94,0.05)",
    borderColor: "rgba(244,63,94,0.22)",
    hint: "Modo fuego. Volver a la base: dormir, calma, agua.",
    glowClass: "shadow-glow-red",
  },
};
