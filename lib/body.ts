// ============================================================
// AARON OS v2 — Body OS  (v2)
// ============================================================

export interface BodyScan {
  id: string;
  date: string;                         // yyyy-mm-dd
  peso_kg: number | null;
  imc: number | null;
  clasificacion_imc: string | null;
  grasa_corporal_pct: number | null;
  masa_libre_grasa_kg: number | null;
  agua_corporal_pct: number | null;
  grasa_visceral_nivel: number | null;
  masa_osea_kg: number | null;
  proteinas_pct: number | null;
  masa_musculoesqueletica_kg: number | null;
  tasa_metabolica_basal_kcal: number | null;
  frecuencia_cardiaca_ppm: number | null;
  peso_objetivo_kg: number | null;
  peso_inicial_kg: number | null;
  total_perdido_kg: number | null;
  source?: "scan" | "manual";
}

// ── Todas las métricas disponibles ───────────────────────────

export type MetricKey =
  | "peso_kg"
  | "grasa_corporal_pct"
  | "masa_musculoesqueletica_kg"
  | "agua_corporal_pct"
  | "imc"
  | "grasa_visceral_nivel"
  | "masa_libre_grasa_kg"
  | "masa_osea_kg"
  | "proteinas_pct"
  | "tasa_metabolica_basal_kcal"
  | "frecuencia_cardiaca_ppm";

export const METRICS: {
  key: MetricKey; label: string; unit: string; color: string;
  goodDown: boolean; // true = bajar es bueno (peso, grasa)
}[] = [
  { key: "peso_kg",                    label: "Peso",            unit: "kg",    color: "#22e6ff", goodDown: true  },
  { key: "grasa_corporal_pct",         label: "Grasa corporal",  unit: "%",     color: "#f59e0b", goodDown: true  },
  { key: "masa_musculoesqueletica_kg", label: "Masa muscular",   unit: "kg",    color: "#22d3a5", goodDown: false },
  { key: "agua_corporal_pct",          label: "Agua corporal",   unit: "%",     color: "#60a5fa", goodDown: false },
  { key: "imc",                        label: "IMC",             unit: "",      color: "#a78bfa", goodDown: true  },
  { key: "grasa_visceral_nivel",       label: "Grasa visceral",  unit: " niv",  color: "#f43f5e", goodDown: true  },
  { key: "masa_libre_grasa_kg",        label: "Masa sin grasa",  unit: "kg",    color: "#34d399", goodDown: false },
  { key: "masa_osea_kg",               label: "Masa ósea",       unit: "kg",    color: "#94a3b8", goodDown: false },
  { key: "proteinas_pct",              label: "Proteínas",       unit: "%",     color: "#c084fc", goodDown: false },
  { key: "tasa_metabolica_basal_kcal", label: "TMB",             unit: " kcal", color: "#fb923c", goodDown: false },
  { key: "frecuencia_cardiaca_ppm",    label: "Frec. cardíaca",  unit: " ppm",  color: "#f87171", goodDown: true  },
];

// ── Storage ───────────────────────────────────────────────────

const KEY = "aaron_body_os";

export function loadScans(): BodyScan[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as BodyScan[];
    return data.sort((a, b) => b.date.localeCompare(a.date));
  } catch { return []; }
}

export function saveScans(scans: BodyScan[]): void {
  if (typeof window === "undefined") return;
  const sorted = [...scans].sort((a, b) => b.date.localeCompare(a.date));
  localStorage.setItem(KEY, JSON.stringify(sorted));
}

export function addScan(scans: BodyScan[], data: Omit<BodyScan, "id">): BodyScan[] {
  const scan: BodyScan = { ...data, id: `scan-${Date.now()}` };
  return [...scans, scan].sort((a, b) => b.date.localeCompare(a.date));
}

export function removeScan(scans: BodyScan[], id: string): BodyScan[] {
  return scans.filter(s => s.id !== id);
}

// ── IMC helpers ───────────────────────────────────────────────

export function imcColor(imc: number | null): string {
  if (!imc) return "#64748b";
  if (imc < 18.5) return "#22e6ff";
  if (imc < 25)   return "#22d3a5";
  if (imc < 30)   return "#fbbf24";
  return "#f43f5e";
}
export function imcLabel(imc: number | null): string {
  if (!imc) return "—";
  if (imc < 18.5) return "Bajo peso";
  if (imc < 25)   return "Normal";
  if (imc < 30)   return "Sobrepeso";
  if (imc < 35)   return "Obesidad I";
  return "Obesidad II";
}

// ── Progress ──────────────────────────────────────────────────

export interface BodyProgress {
  pesoInicial: number; pesoActual: number; pesoObjetivo: number;
  perdido: number; faltante: number; porcentajeCompletado: number;
}

export function calcProgress(scans: BodyScan[]): BodyProgress | null {
  if (scans.length === 0) return null;
  const latest    = scans[0];
  const oldest    = scans[scans.length - 1];
  const pesoActual  = latest.peso_kg ?? 0;
  const pesoInicial = latest.peso_inicial_kg ?? oldest.peso_kg ?? pesoActual;
  const pesoObjetivo = latest.peso_objetivo_kg ?? 70.4;
  const perdido  = Math.max(0, pesoInicial - pesoActual);
  const faltante = Math.max(0, pesoActual - pesoObjetivo);
  const totalMeta = Math.max(0.1, pesoInicial - pesoObjetivo);
  return { pesoInicial, pesoActual, pesoObjetivo, perdido, faltante,
    porcentajeCompletado: Math.min(100, (perdido / totalMeta) * 100) };
}

// ── Series cronológicas ───────────────────────────────────────

export type ChartMetric = MetricKey;

export function chartSeries(
  scans: BodyScan[],
  metric: ChartMetric
): { date: string; value: number }[] {
  return [...scans]
    .filter(s => s[metric] !== null && s[metric] !== undefined)
    .map(s => ({ date: s.date.slice(0, 10), value: s[metric] as number }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ── Agregación por período ────────────────────────────────────

export type Period = "week" | "month" | "year" | "all";

function isoWeek(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const wn = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(wn).padStart(2, "0")}`;
}

export interface AggPoint {
  label: string;    // "12 may", "sem 20", "mayo 2026"
  value: number;
  date: string;     // yyyy-mm-dd del punto representativo
  count: number;
}

export function aggregateSeries(
  scans: BodyScan[],
  metric: ChartMetric,
  period: Period
): AggPoint[] {
  const raw = chartSeries(scans, metric);
  if (raw.length === 0) return [];

  if (period === "week" || period === "all") {
    // Día a día — últimos 7 días para "week", todos para "all"
    const filtered = period === "week"
      ? raw.filter(p => {
          const d = new Date(p.date);
          const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
          return d >= cutoff;
        })
      : raw;
    return filtered.map(p => ({
      label: new Date(p.date + "T12:00:00").toLocaleDateString("es-PE", { day: "numeric", month: "short" }),
      value: p.value,
      date: p.date,
      count: 1,
    }));
  }

  if (period === "month") {
    // Por semana ISO — último mes
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
    const filtered = raw.filter(p => new Date(p.date) >= cutoff);
    const groups: Record<string, { vals: number[]; dates: string[] }> = {};
    for (const p of filtered) {
      const w = isoWeek(new Date(p.date + "T12:00:00"));
      if (!groups[w]) groups[w] = { vals: [], dates: [] };
      groups[w].vals.push(p.value);
      groups[w].dates.push(p.date);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([w, g]) => {
      const avg = g.vals.reduce((s, v) => s + v, 0) / g.vals.length;
      const [, wn] = w.split("-W");
      return { label: `Sem ${wn}`, value: Math.round(avg * 10) / 10, date: g.dates[0], count: g.vals.length };
    });
  }

  // year — por mes
  const cutoff = new Date(); cutoff.setFullYear(cutoff.getFullYear() - 1);
  const filtered = raw.filter(p => new Date(p.date) >= cutoff);
  const groups: Record<string, { vals: number[]; dates: string[] }> = {};
  for (const p of filtered) {
    const m = p.date.slice(0, 7);
    if (!groups[m]) groups[m] = { vals: [], dates: [] };
    groups[m].vals.push(p.value);
    groups[m].dates.push(p.date);
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([m, g]) => {
    const avg = g.vals.reduce((s, v) => s + v, 0) / g.vals.length;
    const d = new Date(m + "-01T12:00:00");
    return {
      label: d.toLocaleDateString("es-PE", { month: "short", year: "2-digit" }),
      value: Math.round(avg * 10) / 10,
      date: g.dates[0],
      count: g.vals.length,
    };
  });
}

// ── Stats de período ──────────────────────────────────────────

export interface PeriodStats {
  current: number; first: number; delta: number; deltaPct: number;
  max: number; min: number; avg: number; count: number;
}

export function periodStats(points: AggPoint[]): PeriodStats | null {
  if (points.length === 0) return null;
  const vals   = points.map(p => p.value);
  const first  = vals[0];
  const current = vals[vals.length - 1];
  const delta  = current - first;
  const max    = Math.max(...vals);
  const min    = Math.min(...vals);
  const avg    = Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10;
  return { current, first, delta: Math.round(delta * 10) / 10,
    deltaPct: Math.round((delta / first) * 1000) / 10,
    max, min, avg, count: points.length };
}

// ── Export / Import ───────────────────────────────────────────

export function exportScans(scans: BodyScan[]): void {
  const json = JSON.stringify(scans, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `aaron-body-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importScans(json: string): BodyScan[] | null {
  try {
    const data = JSON.parse(json);
    if (!Array.isArray(data)) return null;
    return data as BodyScan[];
  } catch { return null; }
}
