"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Trash2, X, CheckCircle2, Loader2, Plus, ChevronDown, ChevronUp, Pencil } from "lucide-react";
import {
  loadScans, saveScans, addScan, removeScan, calcProgress, imcColor, imcLabel,
  aggregateSeries, periodStats, METRICS, exportScans, importScans,
  type BodyScan, type MetricKey, type Period,
} from "@/lib/body";
import { Card } from "@/components/ui/Card";

// ─────────────────────────────────────────────────────────────
// CHART SVG
// ─────────────────────────────────────────────────────────────
function BodyChart({
  data, color, unit, goodDown, height = 120,
}: {
  data: { label: string; value: number }[];
  color: string; unit: string; goodDown: boolean; height?: number;
}) {
  if (data.length === 0) return (
    <div className="flex items-center justify-center py-8 text-xs text-slate-700">Sin datos para este período</div>
  );

  const W = 600, H = height, PAD = { t: 12, b: 28, l: 8, r: 8 };
  const vals  = data.map(d => d.value);
  const min   = Math.min(...vals) * (goodDown ? 0.998 : 0.995);
  const max   = Math.max(...vals) * (goodDown ? 1.002 : 1.005);
  const range = Math.max(0.01, max - min);
  const iW    = W - PAD.l - PAD.r;
  const iH    = H - PAD.t - PAD.b;

  const toX = (i: number) => PAD.l + (i / Math.max(1, data.length - 1)) * iW;
  const toY = (v: number) => PAD.t + (1 - (v - min) / range) * iH;

  const pts   = data.map((d, i) => `${toX(i)},${toY(d.value)}`);
  const first = vals[0], last = vals[vals.length - 1];
  const delta = last - first;
  const isGood = goodDown ? delta <= 0 : delta >= 0;
  const deltaColor = delta === 0 ? "#64748b" : isGood ? "#22d3a5" : "#f43f5e";

  // Show every Nth label to avoid clutter
  const maxLabels = 8;
  const step = Math.ceil(data.length / maxLabels);

  return (
    <div>
      {/* Delta summary */}
      {data.length >= 2 && (
        <div className="mb-3 flex items-baseline gap-3">
          <span className="text-2xl font-black tabular-nums" style={{ color }}>
            {last.toFixed(1)}<span className="text-sm font-normal text-slate-600 ml-0.5">{unit}</span>
          </span>
          <span className="text-sm font-bold" style={{ color: deltaColor }}>
            {delta > 0 ? "+" : ""}{delta.toFixed(1)}{unit}
          </span>
          <span className="text-xs text-slate-600">vs inicio del período</span>
        </div>
      )}
      {data.length === 1 && (
        <div className="mb-3">
          <span className="text-2xl font-black tabular-nums" style={{ color }}>
            {last.toFixed(1)}<span className="text-sm font-normal text-slate-600 ml-0.5">{unit}</span>
          </span>
        </div>
      )}

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`bg-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid */}
        {[0, 0.25, 0.5, 0.75, 1].map(f => {
          const y = PAD.t + f * iH;
          const v = max - f * range;
          return (
            <g key={f}>
              <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              {f !== 1 && (
                <text x={W - PAD.r + 2} y={y + 4} fontSize="9" fill="rgba(255,255,255,0.2)" textAnchor="start">
                  {v.toFixed(1)}
                </text>
              )}
            </g>
          );
        })}

        {/* Area fill */}
        {data.length >= 2 && (
          <polygon
            points={`${toX(0)},${H - PAD.b} ${pts.join(" ")} ${toX(data.length - 1)},${H - PAD.b}`}
            fill={`url(#bg-${color.slice(1)})`}
          />
        )}

        {/* Line */}
        {data.length >= 2 && (
          <polyline points={pts.join(" ")} fill="none" stroke={color}
            strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        )}

        {/* Dots */}
        {data.map((d, i) => {
          const isLast = i === data.length - 1;
          return (
            <circle key={i} cx={toX(i)} cy={toY(d.value)} r={isLast ? 4 : 2.5}
              fill={isLast ? color : `${color}aa`}
              style={{ filter: isLast ? `drop-shadow(0 0 5px ${color})` : "none" }}
            />
          );
        })}

        {/* X labels */}
        {data.map((d, i) => {
          if (i % step !== 0 && i !== data.length - 1) return null;
          return (
            <text key={i} x={toX(i)} y={H - 4} fontSize="9" fill="rgba(255,255,255,0.3)"
              textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}>
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// METRIC CARD (individual con período selector)
// ─────────────────────────────────────────────────────────────
function MetricCard({
  metricKey, label, unit, color, goodDown, scans, period,
}: {
  metricKey: MetricKey; label: string; unit: string; color: string;
  goodDown: boolean; scans: BodyScan[]; period: Period;
}) {
  const points = useMemo(() => aggregateSeries(scans, metricKey, period), [scans, metricKey, period]);
  const stats  = useMemo(() => periodStats(points), [points]);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: color }} />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</span>
        </div>
        {stats && (
          <div className="flex gap-3 text-[10px] text-slate-600">
            <span>↑ {stats.max.toFixed(1)}</span>
            <span>↓ {stats.min.toFixed(1)}</span>
            <span>⌀ {stats.avg.toFixed(1)}{unit}</span>
          </div>
        )}
      </div>
      <BodyChart data={points} color={color} unit={unit} goodDown={goodDown} height={110} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PROGRESS BAR
// ─────────────────────────────────────────────────────────────
function GoalBar({ scans }: { scans: BodyScan[] }) {
  const p = useMemo(() => calcProgress(scans), [scans]);
  if (!p) return null;
  const { pesoInicial, pesoActual, pesoObjetivo, perdido, faltante, porcentajeCompletado } = p;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="mb-3 text-[11px] uppercase tracking-widest text-slate-500">Objetivo de peso</div>
      <div className="mb-1 flex justify-between text-xs text-slate-500">
        <span>Inicial <span className="font-mono text-slate-300">{pesoInicial.toFixed(1)} kg</span></span>
        <span>Actual <span className="font-mono font-bold text-white">{pesoActual.toFixed(1)} kg</span></span>
        <span>Meta <span className="font-mono text-emerald-400">{pesoObjetivo.toFixed(1)} kg</span></span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/[0.05]">
        <motion.div className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg,#22d3a5,#22e6ff)" }}
          initial={{ width: 0 }} animate={{ width: `${porcentajeCompletado}%` }}
          transition={{ duration: 1, ease: "easeOut" }} />
      </div>
      <div className="mt-2 flex justify-between text-[10px]">
        <span className="text-emerald-400">▼ {perdido.toFixed(1)} kg perdidos · {porcentajeCompletado.toFixed(0)}%</span>
        <span className="text-slate-600">Faltan {faltante.toFixed(1)} kg</span>
      </div>
      {scans[0]?.imc && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <div className="h-1.5 w-1.5 rounded-full" style={{ background: imcColor(scans[0].imc) }} />
          <span className="text-slate-500">IMC <span className="font-mono text-slate-300">{scans[0].imc}</span>
            {" — "}<span style={{ color: imcColor(scans[0].imc) }}>{imcLabel(scans[0].imc)}</span></span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MANUAL ENTRY FORM
// ─────────────────────────────────────────────────────────────
function ManualEntryForm({ onAdd, onClose }: {
  onAdd: (data: Omit<BodyScan, "id">) => void;
  onClose: () => void;
}) {
  const [date, setDate]   = useState(new Date().toISOString().slice(0, 10));
  const [peso, setPeso]   = useState("");
  const [grasa, setGrasa] = useState("");
  const [musculo, setMusculo] = useState("");
  const [agua, setAgua]   = useState("");
  const [imc, setImc]     = useState("");
  const [visceral, setVisceral] = useState("");

  function handleSubmit() {
    if (!peso) return;
    onAdd({
      date,
      peso_kg: parseFloat(peso) || null,
      imc: parseFloat(imc) || null,
      clasificacion_imc: null,
      grasa_corporal_pct: parseFloat(grasa) || null,
      masa_libre_grasa_kg: null,
      agua_corporal_pct: parseFloat(agua) || null,
      grasa_visceral_nivel: parseFloat(visceral) || null,
      masa_osea_kg: null,
      proteinas_pct: null,
      masa_musculoesqueletica_kg: parseFloat(musculo) || null,
      tasa_metabolica_basal_kcal: null,
      frecuencia_cardiaca_ppm: null,
      peso_objetivo_kg: 70.4,
      peso_inicial_kg: 84.3,
      total_perdido_kg: null,
      source: "manual",
    });
    onClose();
  }

  const inputClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-slate-700 focus:border-cyan-400/40 focus:outline-none";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#0d1825] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="text-sm font-bold uppercase tracking-widest text-slate-300">Entrada manual</div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-300"><X size={18} /></button>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-[10px] uppercase tracking-widest text-slate-600">Fecha</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          {[
            { label: "Peso (kg) *", val: peso, set: setPeso, placeholder: "82.2" },
            { label: "IMC",         val: imc,  set: setImc,  placeholder: "26.5" },
            { label: "Grasa (%)",   val: grasa, set: setGrasa, placeholder: "25.5" },
            { label: "Músculo (kg)",val: musculo, set: setMusculo, placeholder: "33.3" },
            { label: "Agua (%)",    val: agua, set: setAgua, placeholder: "49.2" },
            { label: "Visceral niv",val: visceral, set: setVisceral, placeholder: "11" },
          ].map(({ label, val, set, placeholder }) => (
            <div key={label}>
              <label className="mb-1 block text-[10px] uppercase tracking-widest text-slate-600">{label}</label>
              <input type="number" step="0.1" value={val} onChange={e => set(e.target.value)}
                placeholder={placeholder} className={inputClass} />
            </div>
          ))}
        </div>

        <button onClick={handleSubmit} disabled={!peso}
          className="w-full rounded-2xl border border-cyan-400/30 bg-cyan-400/10 py-3 text-sm font-bold text-cyan-300 transition-all hover:bg-cyan-400/20 disabled:opacity-30">
          Guardar medición
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// EXPORT / IMPORT
// ─────────────────────────────────────────────────────────────
function ExportImport({ scans, onImport }: {
  scans: BodyScan[];
  onImport: (data: BodyScan[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const imported = importScans(ev.target?.result as string);
      if (imported) onImport(imported);
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex gap-1.5">
      {scans.length > 0 && (
        <button
          onClick={() => exportScans(scans)}
          className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] px-3 py-2 text-xs font-bold text-slate-500 transition-all hover:border-white/[0.15] hover:text-slate-300"
          title="Exportar datos a JSON"
        >
          ↓ Export
        </button>
      )}
      <button
        onClick={() => fileRef.current?.click()}
        className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] px-3 py-2 text-xs font-bold text-slate-500 transition-all hover:border-white/[0.15] hover:text-slate-300"
        title="Importar datos desde JSON"
      >
        ↑ Import
      </button>
      <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
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
    setState("loading"); setErrMsg(""); setExtracted(null);
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
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: b64, mediaType: file.type || "image/jpeg" }),
    });
    if (!resp.ok) { setErrMsg((await resp.json()).error ?? "Error"); setState("error"); return; }
    setExtracted((await resp.json()).data);
    setState("done");
  }, []);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (f) processFile(f);
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) processFile(f);
  }
  function handleConfirm() {
    if (!extracted) return;
    const now = new Date();
    const ds = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
    onScanned({
      date: (extracted.fecha_medicion as string) ?? ds,
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
      peso_objetivo_kg: 70.4,
      peso_inicial_kg: 84.3,
      total_perdido_kg: null,
      source: "scan",
    });
    setState("idle"); setPreview(null); setExtracted(null);
    if (inputRef.current) inputRef.current.value = "";
  }
  function reset() {
    setState("idle"); setPreview(null); setExtracted(null); setErrMsg("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      {state === "idle" && (
        <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-white/[0.08] bg-white/[0.01] py-6 transition-all hover:border-cyan-400/40">
          <Upload size={16} className="text-slate-500" />
          <div className="text-xs text-slate-500">Subir captura de báscula · Claude extrae todo automáticamente</div>
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </div>
      )}
      {state === "loading" && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/[0.06] py-6 text-xs text-slate-500">
          <Loader2 size={14} className="animate-spin text-cyan-400" /> Claude Vision analizando…
        </div>
      )}
      {state === "error" && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-4 text-center text-xs text-red-400">
          {errMsg} <button onClick={reset} className="ml-2 underline text-slate-500">Reintentar</button>
        </div>
      )}
      {state === "done" && extracted && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.04] p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400"><CheckCircle2 size={13} /> Datos extraídos</div>
            <button onClick={reset}><X size={14} className="text-slate-600" /></button>
          </div>
          <div className="flex gap-3">
            {preview && <img src={preview} alt="scan" className="h-20 w-auto shrink-0 rounded-lg object-cover" />}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 flex-1">
              {[
                { k: "Peso", v: extracted.peso_kg, u: "kg" },
                { k: "IMC",  v: extracted.imc, u: "" },
                { k: "Grasa", v: extracted.grasa_corporal_pct, u: "%" },
                { k: "Músculo", v: extracted.masa_musculoesqueletica_kg, u: "kg" },
              ].filter(({ v }) => v != null).map(({ k, v, u }) => (
                <div key={k} className="flex items-baseline gap-1">
                  <span className="text-[10px] text-slate-500">{k}:</span>
                  <span className="font-mono text-sm font-bold text-white">{v as number}{u}</span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleConfirm}
            className="mt-3 w-full rounded-xl border border-emerald-500/25 bg-emerald-500/8 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/15 transition-all">
            Guardar en historial
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PERIOD TABS
// ─────────────────────────────────────────────────────────────
const PERIODS: { key: Period; label: string }[] = [
  { key: "week",  label: "Semana"  },
  { key: "month", label: "Mes"     },
  { key: "year",  label: "Año"     },
  { key: "all",   label: "Todo"    },
];

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function CuerpoPage() {
  const [scans, setScans]       = useState<BodyScan[]>([]);
  const [mounted, setMounted]   = useState(false);
  const [period, setPeriod]     = useState<Period>("month");
  const [showAdd, setShowAdd]   = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => { setScans(loadScans()); setMounted(true); }, []);

  function handleScanned(data: Omit<BodyScan, "id">) {
    const updated = addScan(scans, data);
    setScans(updated); saveScans(updated); setShowAdd(false);
  }
  function handleManual(data: Omit<BodyScan, "id">) {
    const updated = addScan(scans, data);
    setScans(updated); saveScans(updated);
  }
  function handleRemove(id: string) {
    const updated = removeScan(scans, id);
    setScans(updated); saveScans(updated);
  }

  if (!mounted) return null;

  const hasData = scans.length > 0;
  const latest  = scans[0] ?? null;

  // Métricas con datos
  const availableMetrics = METRICS.filter(m =>
    scans.some(s => s[m.key] !== null && s[m.key] !== undefined)
  );


  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Body OS</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {hasData ? `${scans.length} medición${scans.length > 1 ? "es" : ""}` : "Sin mediciones"}
            {latest && ` · última ${latest.date}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowManual(true)}
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] px-3 py-2 text-xs font-bold text-slate-400 transition-all hover:border-white/[0.15] hover:text-slate-200">
            <Pencil size={12} /> Manual
          </button>
          <button onClick={() => setShowAdd(s => !s)}
            className="flex items-center gap-1.5 rounded-xl border border-cyan-400/25 bg-cyan-400/8 px-3 py-2 text-xs font-bold text-cyan-400 transition-all hover:bg-cyan-400/15">
            <Upload size={12} /> Captura
          </button>
          <ExportImport scans={scans} onImport={(imported) => {
            const merged = [...scans, ...imported.filter(i => !scans.find(s => s.id === i.id))];
            const sorted = merged.sort((a,b) => b.date.localeCompare(a.date));
            setScans(sorted); saveScans(sorted);
          }} />
        </div>
      </div>

      {/* Upload */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card><UploadZone onScanned={handleScanned} /></Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sin datos */}
      {!hasData && (
        <div className="py-12 text-center space-y-3">
          <div className="text-slate-600 text-sm">Sin mediciones aún</div>
          <div className="text-slate-700 text-xs">Sube una captura o agrega datos manualmente</div>
        </div>
      )}

      {/* Progreso hacia objetivo */}
      {hasData && <GoalBar scans={scans} />}

      {/* Period selector */}
      {hasData && (
        <div className="flex gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
                period === p.key
                  ? "bg-cyan-400/15 text-cyan-400"
                  : "text-slate-600 hover:text-slate-400"
              }`}>
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Grid de TODAS las métricas */}
      {hasData && availableMetrics.length > 0 && (
        <div className="space-y-3">
          <div className="text-[11px] uppercase tracking-widest text-slate-500">
            Evolución por métrica — {availableMetrics.length} disponibles
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {availableMetrics.map(m => {
              const points = aggregateSeries(scans, m.key, period);
              const stats  = periodStats(points);
              return (
                <div key={m.key} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                  {/* Header */}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ background: m.color }} />
                      <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: m.color }}>
                        {m.label}
                      </span>
                    </div>
                    {stats && (
                      <div className="flex gap-2 text-[9px] text-slate-600">
                        <span title="Máximo">↑{stats.max.toFixed(1)}</span>
                        <span title="Mínimo">↓{stats.min.toFixed(1)}</span>
                        <span title="Promedio">⌀{stats.avg.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  {/* Valor actual + delta */}
                  {stats && (
                    <div className="mb-3 flex items-baseline gap-2">
                      <span className="text-2xl font-black tabular-nums" style={{ color: m.color }}>
                        {stats.current.toFixed(1)}
                        <span className="text-xs font-normal text-slate-600 ml-0.5">{m.unit}</span>
                      </span>
                      {points.length >= 2 && (() => {
                        const delta = stats.current - stats.first;
                        const isGood = m.goodDown ? delta <= 0 : delta >= 0;
                        const dc = delta === 0 ? "#64748b" : isGood ? "#22d3a5" : "#f43f5e";
                        return (
                          <span className="text-sm font-bold" style={{ color: dc }}>
                            {delta > 0 ? "+" : ""}{delta.toFixed(1)}{m.unit}
                          </span>
                        );
                      })()}
                    </div>
                  )}
                  {/* Gráfico */}
                  <BodyChart data={points} color={m.color} unit={m.unit} goodDown={m.goodDown} height={90} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Historial colapsable */}
      {hasData && (
        <div>
          <button onClick={() => setShowHistory(s => !s)}
            className="flex w-full items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 text-left transition-all hover:border-white/[0.08]">
            <span className="text-[11px] uppercase tracking-widest text-slate-500">
              Historial · {scans.length} medición{scans.length > 1 ? "es" : ""}
            </span>
            {showHistory ? <ChevronUp size={14} className="text-slate-600" /> : <ChevronDown size={14} className="text-slate-600" />}
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-2 overflow-hidden">
                {scans.map((s, i) => (
                  <motion.div key={s.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3">
                    {i === 0 && (
                      <span className="shrink-0 rounded-md border border-cyan-400/25 bg-cyan-400/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-cyan-400">
                        último
                      </span>
                    )}
                    {s.source === "manual" && (
                      <span className="shrink-0 rounded-md border border-slate-500/25 bg-slate-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                        manual
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        {s.peso_kg && <span className="font-mono text-sm font-black text-white">{s.peso_kg} kg</span>}
                        {s.grasa_corporal_pct && <span className="text-xs text-slate-500">Grasa {s.grasa_corporal_pct}%</span>}
                        {s.imc && <span className="text-xs font-semibold" style={{ color: imcColor(s.imc) }}>IMC {s.imc}</span>}
                        {s.masa_musculoesqueletica_kg && <span className="text-xs text-slate-500">Músculo {s.masa_musculoesqueletica_kg}kg</span>}
                      </div>
                      <div className="text-[10px] text-slate-600">{s.date}</div>
                    </div>
                    <button onClick={() => handleRemove(s.id)} className="text-slate-700 hover:text-red-400 transition-colors shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Modal entrada manual */}
      <AnimatePresence>
        {showManual && (
          <ManualEntryForm onAdd={handleManual} onClose={() => setShowManual(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
