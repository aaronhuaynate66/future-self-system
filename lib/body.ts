// ============================================================
// AARON OS v2 — Body OS
// ============================================================

export interface BodyScan {
  id: string;
  date: string;                         // yyyy-mm-dd HH:MM
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
  imageThumb?: string;                  // base64 thumbnail opcional
}

const KEY = "aaron_body_os";

export function loadScans(): BodyScan[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as BodyScan[]) : [];
  } catch { return []; }
}

export function saveScans(scans: BodyScan[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(scans));
}

export function addScan(scans: BodyScan[], data: Omit<BodyScan, "id">): BodyScan[] {
  const scan: BodyScan = { ...data, id: `scan-${Date.now()}` };
  return [scan, ...scans];
}

export function removeScan(scans: BodyScan[], id: string): BodyScan[] {
  return scans.filter(s => s.id !== id);
}

// ── IMC helpers ──────────────────────────────────────────────

export function imcColor(imc: number | null): string {
  if (!imc) return "#64748b";
  if (imc < 18.5) return "#22e6ff";   // bajo peso
  if (imc < 25)   return "#22d3a5";   // normal
  if (imc < 30)   return "#fbbf24";   // sobrepeso
  return "#f43f5e";                    // obesidad
}

export function imcLabel(imc: number | null): string {
  if (!imc) return "—";
  if (imc < 18.5) return "Bajo peso";
  if (imc < 25)   return "Normal";
  if (imc < 30)   return "Sobrepeso";
  if (imc < 35)   return "Obesidad I";
  return "Obesidad II";
}

// ── Progreso ─────────────────────────────────────────────────

export interface BodyProgress {
  pesoInicial: number;
  pesoActual: number;
  pesoObjetivo: number;
  perdido: number;
  faltante: number;
  porcentajeCompletado: number;
}

export function calcProgress(scans: BodyScan[]): BodyProgress | null {
  if (scans.length === 0) return null;

  const latest = scans[0];
  const oldest = scans[scans.length - 1];

  const pesoActual  = latest.peso_kg ?? 0;
  const pesoInicial = latest.peso_inicial_kg ?? oldest.peso_kg ?? pesoActual;
  const pesoObjetivo = latest.peso_objetivo_kg ?? 70;

  const perdido = Math.max(0, pesoInicial - pesoActual);
  const faltante = Math.max(0, pesoActual - pesoObjetivo);
  const totalMeta = Math.max(0.1, pesoInicial - pesoObjetivo);
  const porcentajeCompletado = Math.min(100, (perdido / totalMeta) * 100);

  return { pesoInicial, pesoActual, pesoObjetivo, perdido, faltante, porcentajeCompletado };
}

// ── Series para gráficos ─────────────────────────────────────

export type ChartMetric = "peso_kg" | "grasa_corporal_pct" | "masa_musculoesqueletica_kg" | "imc" | "agua_corporal_pct";

export function chartSeries(scans: BodyScan[], metric: ChartMetric): { date: string; value: number }[] {
  return scans
    .filter(s => s[metric] !== null)
    .map(s => ({ date: s.date.slice(0, 10), value: s[metric] as number }))
    .reverse(); // cronológico
}
