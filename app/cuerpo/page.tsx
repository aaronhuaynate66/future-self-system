"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Trash2, TrendingDown, TrendingUp,
  Scale, Activity, Droplets, Zap, X, CheckCircle2, Loader2, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  loadScans, saveScans, addScan, removeScan,
  calcProgress, chartSeries, imcColor, imcLabel,
  type BodyScan, type ChartMetric,
} from "@/lib/body";
import { Card } from "@/components/ui/Card";

// ─────────────────────────────────────────────────────────────
// MINI LINE CHART
// ─────────────────────────────────────────────────────────────
function MiniChart({
  data, color, label, unit,
}: {
  data: { date: string; value: number }[];
  color: string; label: string; unit: string;
}) {
  const W = 280, H = 72, PAD = 6;
  const vals  = data.map(d => d.value);
  const min   = Math.min(...vals) * 0.995;
  const max   = Math.max(...vals) * 1.005;
  const range = Math.max(0.01, max - min);

  const toX = (i: number) => PAD + (i / Math.max(1, data.length - 1)) * (W - PAD * 2);
  const toY = (v: number) => H - PAD - ((v - min) / range) * (H - PAD * 2);

  const pts    = data.map((d, i) => `${toX(i)},${toY(d.value)}`);
  const latest = vals[vals.length - 1];
  const first  = vals[0];
  const delta  = latest - first;
  const isGood = label === "Peso" || label === "Grasa corporal" ? delta <= 0 : delta >= 0;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</span>
        {data.length >= 2 && (
          <span className="text-[11px] font-bold" style={{ color: isGood ? "#22d3a5" : "#f43f5e" }}>
            {delta > 0 ? "+" : ""}{delta.toFixed(1)}{unit}
          </span>
        )}
      </div>

      <div className="flex items-end gap-4">
        {/* Valor actual grande */}
        <div>
          <div className="text-3xl font-black tabular-nums leading-none" style={{ color }}>
            {latest.toFixed(1)}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-600">{unit}</div>
        </div>

        {/* Gráfico */}
        <div className="flex-1">
          {data.length >= 2 ? (
            <svg viewBox={`0 0 ${W} ${H}`} style={{ height: 52, width: "100%" }} preserveAspectRatio="none">
              <defs>
                <linearGradient id={`g-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity="0.20" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              {[0.25, 0.5, 0.75].map(f => (
                <line key={f} x1={PAD} y1={PAD + f * (H - PAD * 2)} x2={W - PAD} y2={PAD + f * (H - PAD * 2)}
                  stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              ))}
              {/* Area */}
              <polygon
                points={`${toX(0)},${H} ${pts.join(" ")} ${toX(data.length - 1)},${H}`}
                fill={`url(#g-${label})`}
              />
              {/* Line */}
              <polyline points={pts.join(" ")} fill="none" stroke={color}
                strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
              {/* Dots */}
              {data.map((_, i) => (
                <circle key={i} cx={toX(i)} cy={toY(_.value)} r="2.5" fill={color}
                  style={{ filter: i === data.length - 1 ? `drop-shadow(0 0 4px ${color})` : "none" }} />
              ))}
            </svg>
          ) : (
            <div className="flex h-12 items-center justify-center rounded-lg border border-dashed border-white/[0.06]">
              <span className="text-[10px] text-slate-700">2+ mediciones para ver evolución</span>
            </div>
          )}
        </div>
      </div>

      {/* Fechas */}
      {data.length >= 2 && (
        <div className="mt-2 flex justify-between text-[9px] text-slate-700">
          <span>{data[0].date}</span>
          <span>{data[data.length - 1].date}</span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PROGRESS TOWARD GOAL
// ─────────────────────────────────────────────────────────────
function GoalProgress({ scans }: { scans: BodyScan[] }) {
  const progress = useMemo(() => calcProgress(scans), [scans]);
  if (!progress) return null;

  const { pesoInicial, pesoActual, pesoObjetivo, perdido, faltante, porcentajeCompletado } = progress;
  const imcCol = imcColor(scans[0]?.imc ?? null);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="mb-4 text-[11px] uppercase tracking-widest text-slate-500">Objetivo de peso</div>

      {/* Barra de progreso horizontal */}
      <div className="mb-4">
        <div className="mb-2 flex justify-between text-xs text-slate-500">
          <span>Inicial: <span className="text-slate-300 font-mono">{pesoInicial.toFixed(1)} kg</span></span>
          <span>Objetivo: <span className="text-emerald-400 font-mono">{pesoObjetivo.toFixed(1)} kg</span></span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/[0.05]">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #22d3a5, #22e6ff)" }}
            initial={{ width: 0 }}
            animate={{ width: `${porcentajeCompletado}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          {/* Marcador actual */}
          <motion.div
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-cyan-400"
            style={{ boxShadow: "0 0 8px rgba(34,230,255,0.6)" }}
            initial={{ left: 0 }}
            animate={{ left: `${porcentajeCompletado}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="mt-1 text-center text-[10px] text-slate-600">
          Actual: <span className="font-mono font-bold text-white">{pesoActual.toFixed(1)} kg</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-white/[0.03] p-2">
          <div className="text-[10px] uppercase tracking-widest text-slate-600">Perdido</div>
          <div className="mt-1 font-mono text-lg font-black text-emerald-400">
            {perdido > 0 ? `-${perdido.toFixed(1)}` : "0"} kg
          </div>
        </div>
        <div className="rounded-xl bg-white/[0.03] p-2">
          <div className="text-[10px] uppercase tracking-widest text-slate-600">Progreso</div>
          <div className="mt-1 font-mono text-lg font-black text-cyan-400">
            {porcentajeCompletado.toFixed(0)}%
          </div>
        </div>
        <div className="rounded-xl bg-white/[0.03] p-2">
          <div className="text-[10px] uppercase tracking-widest text-slate-600">Falta</div>
          <div className="mt-1 font-mono text-lg font-black text-slate-400">
            {faltante > 0 ? `${faltante.toFixed(1)}` : "✓"} {faltante > 0 ? "kg" : ""}
          </div>
        </div>
      </div>

      {/* IMC */}
      {scans[0]?.imc && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/[0.04] px-3 py-2">
          <div className="h-2 w-2 rounded-full" style={{ background: imcCol }} />
          <span className="text-xs text-slate-400">
            IMC <span className="font-mono font-bold text-slate-200">{scans[0].imc}</span>
            {" — "}<span style={{ color: imcCol }}>{imcLabel(scans[0].imc)}</span>
          </span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STAT GRID (última medición)
// ─────────────────────────────────────────────────────────────
const STATS_CONFIG = [
  { key: "peso_kg" as const,                     label: "Peso",            unit: "kg",   color: "#22e6ff", icon: Scale },
  { key: "grasa_corporal_pct" as const,          label: "Grasa corporal",  unit: "%",    color: "#f59e0b", icon: TrendingDown },
  { key: "masa_musculoesqueletica_kg" as const,  label: "Masa muscular",   unit: "kg",   color: "#22d3a5", icon: TrendingUp },
  { key: "agua_corporal_pct" as const,           label: "Agua corporal",   unit: "%",    color: "#60a5fa", icon: Droplets },
  { key: "grasa_visceral_nivel" as const,        label: "Grasa visceral",  unit: " niv", color: "#f43f5e", icon: Activity },
  { key: "tasa_metabolica_basal_kcal" as const,  label: "TMB",             unit: " kcal",color: "#a78bfa", icon: Zap },
  { key: "masa_libre_grasa_kg" as const,         label: "Masa sin grasa",  unit: "kg",   color: "#34d399", icon: TrendingUp },
  { key: "masa_osea_kg" as const,                label: "Masa ósea",       unit: "kg",   color: "#94a3b8", icon: Activity },
  { key: "proteinas_pct" as const,               label: "Proteínas",       unit: "%",    color: "#c084fc", icon: TrendingUp },
];

const CHART_METRICS: { key: ChartMetric; label: string; unit: string; color: string }[] = [
  { key: "peso_kg",                    label: "Peso",           unit: "kg", color: "#22e6ff" },
  { key: "grasa_corporal_pct",         label: "Grasa corporal", unit: "%",  color: "#f59e0b" },
  { key: "masa_musculoesqueletica_kg", label: "Masa muscular",  unit: "kg", color: "#22d3a5" },
  { key: "agua_corporal_pct",          label: "Agua corporal",  unit: "%",  color: "#60a5fa" },
];

function StatGrid({ scan, prev }: { scan: BodyScan; prev: BodyScan | null }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {STATS_CONFIG.map(({ key, label, unit, color, icon: Icon }) => {
        const val  = scan[key];
        const pval = prev?.[key];
        if (val === null || val === undefined) return null;
        const delta = (pval !== null && pval !== undefined) ? (val as number) - (pval as number) : null;
        const isGood = key === "peso_kg" || key === "grasa_corporal_pct" || key === "grasa_visceral_nivel"
          ? (delta ?? 0) <= 0
          : (delta ?? 0) >= 0;

        return (
          <div key={key} className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-3">
            <div className="rounded-lg p-1.5 shrink-0" style={{ background: `${color}18` }}>
              <Icon size={13} style={{ color }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-widest text-slate-600 truncate">{label}</div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-sm font-bold" style={{ color }}>
                  {(val as number).toFixed(1)}<span className="text-[9px] font-normal text-slate-600 ml-0.5">{unit}</span>
                </span>
                {delta !== null && Math.abs(delta) > 0.05 && (
                  <span className="text-[9px] font-bold" style={{ color: isGood ? "#22d3a5" : "#f43f5e" }}>
                    {delta > 0 ? "+" : ""}{delta.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// UPLOAD ZONE
// ─────────────────────────────────────────────────────────────
type ScanState = "idle" | "loading" | "done" | "error";

function UploadZone({ onScanned }: { onScanned: (data: Omit<BodyScan, "id">) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState]     = useState<ScanState>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [errMsg, setErrMsg]   = useState("");
  const [extracted, setExtracted] = useState<Record<string, number | string | null> | null>(null);

  const processFile = useCallback(async (file: File) => {
    setState("loading");
    setErrMsg(""); setExtracted(null);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    const b64 = await new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload  = () => res((r.result as string).split(",")[1]);
      r.onerror = () => rej(new Error("Read failed"));
      r.readAsDataURL(file);
    });

    const resp = await fetch("/api/body-scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: b64, mediaType: file.type || "image/jpeg" }),
    });
    if (!resp.ok) { setErrMsg((await resp.json()).error ?? "Error"); setState("error"); return; }
    const result = await resp.json();
    setExtracted(result.data);
    setState("done");
  }, []);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }
  function handleConfirm() {
    if (!extracted) return;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")} ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    onScanned({
      date: (extracted.fecha_medicion as string) ?? dateStr,
      peso_kg: extracted.peso_kg as number ?? null,
      imc: extracted.imc as number ?? null,
      clasificacion_imc: extracted.clasificacion_imc as string ?? null,
      grasa_corporal_pct: extracted.grasa_corporal_pct as number ?? null,
      masa_libre_grasa_kg: extracted.masa_libre_grasa_kg as number ?? null,
      agua_corporal_pct: extracted.agua_corporal_pct as number ?? null,
      grasa_visceral_nivel: extracted.grasa_visceral_nivel as number ?? null,
      masa_osea_kg: extracted.masa_osea_kg as number ?? null,
      proteinas_pct: extracted.proteinas_pct as number ?? null,
      masa_musculoesqueletica_kg: extracted.masa_musculoesqueletica_kg as number ?? null,
      tasa_metabolica_basal_kcal: extracted.tasa_metabolica_basal_kcal as number ?? null,
      frecuencia_cardiaca_ppm: extracted.frecuencia_cardiaca_ppm as number ?? null,
      peso_objetivo_kg: extracted.peso_objetivo_kg as number ?? null,
      peso_inicial_kg: extracted.peso_inicial_kg as number ?? null,
      total_perdido_kg: extracted.total_perdido_kg as number ?? null,
    });
    setState("idle"); setPreview(null); setExtracted(null);
    if (inputRef.current) inputRef.current.value = "";
  }
  function handleReset() {
    setState("idle"); setPreview(null); setExtracted(null); setErrMsg("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      {state === "idle" && (
        <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-white/[0.10] bg-white/[0.02] py-8 transition-all hover:border-cyan-400/40 hover:bg-cyan-400/[0.03]"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
            <Upload size={18} className="text-slate-400" />
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-slate-300">Sube captura de tu báscula</div>
            <div className="mt-0.5 text-xs text-slate-600">JPG · PNG · arrastra o haz click</div>
          </div>
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </div>
      )}

      {state === "loading" && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/[0.06] py-10">
          {preview && <img src={preview} alt="preview" className="h-28 w-auto rounded-xl opacity-40" />}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 size={15} className="animate-spin text-cyan-400" />
            Claude Vision analizando…
          </div>
        </div>
      )}

      {state === "error" && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-5 text-center">
          <div className="text-sm text-red-400">{errMsg}</div>
          <button onClick={handleReset} className="mt-3 text-xs text-slate-500 underline">Intentar de nuevo</button>
        </div>
      )}

      {state === "done" && extracted && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.04] p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
              <CheckCircle2 size={15} /> Datos extraídos
            </div>
            <button onClick={handleReset} className="text-slate-600 hover:text-slate-400"><X size={15} /></button>
          </div>
          <div className="flex gap-4">
            {preview && <img src={preview} alt="scan" className="h-28 w-auto shrink-0 rounded-xl object-cover" />}
            <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1.5">
              {[
                { k: "Peso",    v: extracted.peso_kg,                    u: "kg"   },
                { k: "IMC",     v: extracted.imc,                        u: ""     },
                { k: "Grasa",   v: extracted.grasa_corporal_pct,         u: "%"    },
                { k: "Músculo", v: extracted.masa_musculoesqueletica_kg, u: "kg"   },
                { k: "Agua",    v: extracted.agua_corporal_pct,          u: "%"    },
                { k: "TMB",     v: extracted.tasa_metabolica_basal_kcal, u: " kcal"},
              ].filter(({ v }) => v !== null && v !== undefined).map(({ k, v, u }) => (
                <div key={k} className="flex items-baseline gap-1">
                  <span className="text-[10px] text-slate-500">{k}:</span>
                  <span className="font-mono text-sm font-bold text-white">{v as number}{u}</span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleConfirm}
            className="mt-4 w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2.5 text-sm font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all"
          >
            Guardar en historial
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HISTORIAL ITEM
// ─────────────────────────────────────────────────────────────
function HistorialItem({ scan, prev, onRemove, isLatest }: {
  scan: BodyScan; prev: BodyScan | null; onRemove: () => void; isLatest: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const imcCol = imcColor(scan.imc);

  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        {isLatest && (
          <span className="shrink-0 rounded-md border border-cyan-400/25 bg-cyan-400/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-cyan-400">
            último
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            {scan.peso_kg && (
              <span className="font-mono text-base font-black text-white">{scan.peso_kg} kg</span>
            )}
            {scan.grasa_corporal_pct && (
              <span className="text-xs text-slate-500">Grasa <span className="text-slate-300">{scan.grasa_corporal_pct}%</span></span>
            )}
            {scan.imc && (
              <span className="text-xs font-semibold" style={{ color: imcCol }}>IMC {scan.imc}</span>
            )}
            {scan.masa_musculoesqueletica_kg && (
              <span className="text-xs text-slate-500">Músculo <span className="text-slate-300">{scan.masa_musculoesqueletica_kg}kg</span></span>
            )}
          </div>
          <div className="text-[10px] text-slate-600 mt-0.5">{scan.date}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setExpanded(e => !e)} className="text-slate-700 hover:text-slate-400 transition-colors">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button onClick={onRemove} className="text-slate-700 hover:text-red-400 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-white/[0.04] px-4 pb-4 pt-3">
          <StatGrid scan={scan} prev={prev} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function CuerpoPage() {
  const [scans, setScans]     = useState<BodyScan[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => { setScans(loadScans()); setMounted(true); }, []);

  function handleScanned(data: Omit<BodyScan, "id">) {
    const updated = addScan(scans, data);
    setScans(updated);
    saveScans(updated);
    setShowUpload(false);
  }
  function handleRemove(id: string) {
    const updated = removeScan(scans, id);
    setScans(updated);
    saveScans(updated);
  }

  if (!mounted) return null;

  const latest = scans[0] ?? null;
  const hasData = scans.length > 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Body OS</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {hasData ? `${scans.length} medición${scans.length > 1 ? "es" : ""} · última: ${latest?.date}` : "Sin mediciones aún"}
          </p>
        </div>
        <button
          onClick={() => setShowUpload(s => !s)}
          className="flex items-center gap-2 rounded-2xl border border-cyan-400/25 bg-cyan-400/8 px-4 py-2 text-xs font-bold uppercase tracking-widest text-cyan-400 transition-all hover:bg-cyan-400/15"
        >
          <Upload size={13} />
          {showUpload ? "Cancelar" : "Nueva medición"}
        </button>
      </div>

      {/* Upload colapsable */}
      <AnimatePresence>
        {(showUpload || !hasData) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card>{<UploadZone onScanned={handleScanned} />}</Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sin datos */}
      {!hasData && (
        <div className="py-8 text-center text-sm text-slate-600">
          Sube tu primera captura de báscula para comenzar el seguimiento.
        </div>
      )}

      {/* Progreso hacia objetivo */}
      {hasData && <GoalProgress scans={scans} />}

      {/* Stats de la última medición */}
      {latest && (
        <div>
          <div className="mb-3 text-[11px] uppercase tracking-widest text-slate-500">
            Última medición — {latest.date}
          </div>
          <StatGrid scan={latest} prev={scans[1] ?? null} />
        </div>
      )}

      {/* Gráficos de evolución */}
      {hasData && (
        <div>
          <div className="mb-3 text-[11px] uppercase tracking-widest text-slate-500">
            Evolución
            {scans.length < 2 && <span className="ml-2 text-slate-700">(agrega más mediciones para ver la curva)</span>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {CHART_METRICS.map(m => {
              const series = chartSeries(scans, m.key);
              if (series.length === 0) return null;
              return <MiniChart key={m.key} data={series} color={m.color} label={m.label} unit={m.unit} />;
            })}
          </div>
        </div>
      )}

      {/* Historial */}
      {hasData && (
        <div>
          <div className="mb-3 text-[11px] uppercase tracking-widest text-slate-500">
            Historial · {scans.length} medición{scans.length > 1 ? "es" : ""}
          </div>
          <div className="space-y-2">
            {scans.map((s, i) => (
              <motion.div key={s.id} layout initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                <HistorialItem
                  scan={s}
                  prev={scans[i + 1] ?? null}
                  onRemove={() => handleRemove(s.id)}
                  isLatest={i === 0}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
