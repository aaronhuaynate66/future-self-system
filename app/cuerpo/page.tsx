"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Trash2, TrendingDown, TrendingUp,
  Scale, Activity, Droplets, Zap, X, CheckCircle2, Loader2,
} from "lucide-react";
import {
  loadScans, saveScans, addScan, removeScan,
  calcProgress, chartSeries, imcColor, imcLabel,
  type BodyScan, type ChartMetric,
} from "@/lib/body";
import { Card } from "@/components/ui/Card";

// ─────────────────────────────────────────────────────────────
// MINI LINE CHART (SVG, sin librerías)
// ─────────────────────────────────────────────────────────────
function MiniChart({
  data, color, label, unit,
}: {
  data: { date: string; value: number }[];
  color: string;
  label: string;
  unit: string;
}) {
  if (data.length < 2) return null;

  const W = 260, H = 60, PAD = 4;
  const vals = data.map(d => d.value);
  const min  = Math.min(...vals);
  const max  = Math.max(...vals);
  const range = Math.max(0.1, max - min);

  const pts = data.map((d, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((d.value - min) / range) * (H - PAD * 2);
    return `${x},${y}`;
  });

  const polyline = pts.join(" ");
  const latest   = vals[vals.length - 1];
  const first    = vals[0];
  const delta    = latest - first;
  const isDown   = delta < 0;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-slate-500">{label}</span>
        <span
          className="text-[10px] font-bold"
          style={{ color: isDown ? "#22d3a5" : "#f43f5e" }}
        >
          {isDown ? "▼" : "▲"} {Math.abs(delta).toFixed(1)}{unit}
        </span>
      </div>
      <div className="flex items-end gap-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="flex-1" style={{ height: 48 }}>
          <defs>
            <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Area fill */}
          <polygon
            points={`${PAD},${H} ${polyline} ${W - PAD},${H}`}
            fill={`url(#grad-${label})`}
          />
          {/* Line */}
          <polyline
            points={polyline}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Last point */}
          <circle
            cx={pts[pts.length - 1].split(",")[0]}
            cy={pts[pts.length - 1].split(",")[1]}
            r="3"
            fill={color}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        </svg>
        <div className="text-right shrink-0">
          <div className="text-xl font-black tabular-nums" style={{ color }}>
            {latest.toFixed(1)}
          </div>
          <div className="text-[10px] text-slate-600">{unit}</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PROGRESS RING
// ─────────────────────────────────────────────────────────────
function ProgressRing({ pct, color, size = 120 }: { pct: number; color: string; size?: number }) {
  const r   = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ filter: `drop-shadow(0 0 6px ${color}88)`, transition: "stroke-dasharray 0.8s ease" }}
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// STAT PILL
// ─────────────────────────────────────────────────────────────
function StatPill({
  label, value, unit, color, icon: Icon,
}: {
  label: string; value: string | number | null; unit?: string; color: string; icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
      <div className="rounded-lg p-1.5" style={{ background: `${color}18` }}>
        <Icon size={13} style={{ color }} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-slate-600">{label}</div>
        <div className="font-mono text-sm font-bold" style={{ color }}>
          {value ?? "—"}{value !== null && unit ? <span className="text-[10px] font-normal text-slate-500 ml-0.5">{unit}</span> : ""}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// UPLOAD ZONE
// ─────────────────────────────────────────────────────────────
type ScanState = "idle" | "loading" | "done" | "error";

function UploadZone({ onScanned }: { onScanned: (data: Omit<BodyScan, "id">) => void }) {
  const inputRef   = useRef<HTMLInputElement>(null);
  const [state, setState]   = useState<ScanState>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState("");
  const [extracted, setExtracted] = useState<Partial<BodyScan> | null>(null);

  const processFile = useCallback(async (file: File) => {
    setState("loading");
    setErrMsg("");
    setExtracted(null);

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Leer base64
    const b64 = await new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload  = () => res((r.result as string).split(",")[1]);
      r.onerror = () => rej(new Error("Read failed"));
      r.readAsDataURL(file);
    });

    const mediaType = file.type || "image/jpeg";

    const resp = await fetch("/api/body-scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: b64, mediaType }),
    });

    if (!resp.ok) {
      const err = await resp.json();
      setErrMsg(err.error ?? "Error al procesar");
      setState("error");
      return;
    }

    const result = await resp.json();
    const d = result.data;
    setExtracted(d);
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
      date: (extracted as Record<string, unknown>).fecha_medicion as string ?? dateStr,
      peso_kg: extracted.peso_kg ?? null,
      imc: extracted.imc ?? null,
      clasificacion_imc: extracted.clasificacion_imc ?? null,
      grasa_corporal_pct: extracted.grasa_corporal_pct ?? null,
      masa_libre_grasa_kg: extracted.masa_libre_grasa_kg ?? null,
      agua_corporal_pct: extracted.agua_corporal_pct ?? null,
      grasa_visceral_nivel: extracted.grasa_visceral_nivel ?? null,
      masa_osea_kg: extracted.masa_osea_kg ?? null,
      proteinas_pct: extracted.proteinas_pct ?? null,
      masa_musculoesqueletica_kg: extracted.masa_musculoesqueletica_kg ?? null,
      tasa_metabolica_basal_kcal: extracted.tasa_metabolica_basal_kcal ?? null,
      frecuencia_cardiaca_ppm: extracted.frecuencia_cardiaca_ppm ?? null,
      peso_objetivo_kg: extracted.peso_objetivo_kg ?? null,
      peso_inicial_kg: extracted.peso_inicial_kg ?? null,
      total_perdido_kg: extracted.total_perdido_kg ?? null,
    });
    // Reset
    setState("idle");
    setPreview(null);
    setExtracted(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleReset() {
    setState("idle");
    setPreview(null);
    setExtracted(null);
    setErrMsg("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {state === "idle" && (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/[0.10] bg-white/[0.02] py-10 transition-all hover:border-cyan-400/40 hover:bg-cyan-400/[0.03]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
            <Upload size={20} className="text-slate-400" />
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-slate-300">Sube la captura de tu báscula</div>
            <div className="mt-0.5 text-xs text-slate-600">JPG · PNG · WebP · arrastra o haz click</div>
          </div>
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </div>
      )}

      {/* Loading */}
      {state === "loading" && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] py-10">
          {preview && (
            <img src={preview} alt="preview" className="h-32 w-auto rounded-xl object-cover opacity-50" />
          )}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 size={16} className="animate-spin text-cyan-400" />
            Analizando con Claude Vision…
          </div>
        </div>
      )}

      {/* Error */}
      {state === "error" && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-5 text-center">
          <div className="text-sm text-red-400">{errMsg}</div>
          <button onClick={handleReset} className="mt-3 text-xs text-slate-500 underline">
            Intentar de nuevo
          </button>
        </div>
      )}

      {/* Done — preview + datos extraídos */}
      {state === "done" && extracted && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.04] p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
              <CheckCircle2 size={16} />
              Datos extraídos
            </div>
            <button onClick={handleReset} className="text-slate-600 hover:text-slate-400">
              <X size={15} />
            </button>
          </div>

          {/* Preview + resumen */}
          <div className="flex gap-4">
            {preview && (
              <img src={preview} alt="scan" className="h-28 w-auto shrink-0 rounded-xl object-cover" />
            )}
            <div className="flex-1 grid grid-cols-2 gap-2">
              {[
                { k: "Peso",       v: extracted.peso_kg,            u: "kg"  },
                { k: "IMC",        v: extracted.imc,                u: ""    },
                { k: "Grasa",      v: extracted.grasa_corporal_pct, u: "%"   },
                { k: "Músculo",    v: extracted.masa_musculoesqueletica_kg, u: "kg" },
                { k: "Agua",       v: extracted.agua_corporal_pct,  u: "%"   },
                { k: "TMB",        v: extracted.tasa_metabolica_basal_kcal, u: "kcal" },
              ].map(({ k, v, u }) => v !== null && v !== undefined ? (
                <div key={k} className="flex items-baseline gap-1">
                  <span className="text-[10px] text-slate-500">{k}:</span>
                  <span className="font-mono text-sm font-bold text-white">{v}{u}</span>
                </div>
              ) : null)}
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="mt-4 w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2.5 text-sm font-bold text-emerald-400 transition-all hover:bg-emerald-500/20"
          >
            Guardar en historial
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

const CHART_METRICS: { key: ChartMetric; label: string; unit: string; color: string }[] = [
  { key: "peso_kg",                   label: "Peso",            unit: "kg", color: "#22e6ff" },
  { key: "grasa_corporal_pct",        label: "Grasa corporal",  unit: "%",  color: "#f59e0b" },
  { key: "masa_musculoesqueletica_kg",label: "Masa muscular",   unit: "kg", color: "#22d3a5" },
  { key: "agua_corporal_pct",         label: "Agua corporal",   unit: "%",  color: "#60a5fa" },
];

export default function CuerpoPage() {
  const [scans, setScans]     = useState<BodyScan[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setScans(loadScans());
    setMounted(true);
  }, []);

  function handleScanned(data: Omit<BodyScan, "id">) {
    const updated = addScan(scans, data);
    setScans(updated);
    saveScans(updated);
  }

  function handleRemove(id: string) {
    const updated = removeScan(scans, id);
    setScans(updated);
    saveScans(updated);
  }

  if (!mounted) return null;

  const progress = calcProgress(scans);
  const latest   = scans[0] ?? null;
  const imcCol   = imcColor(latest?.imc ?? null);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Body OS</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Sube una captura — Claude extrae todos los datos automáticamente
          </p>
        </div>
      </div>

      {/* Upload */}
      <Card>
        <UploadZone onScanned={handleScanned} />
      </Card>

      {/* Progress hacia objetivo */}
      {progress && (
        <Card>
          <div className="flex items-center gap-6">
            <div className="relative flex shrink-0 items-center justify-center">
              <ProgressRing pct={progress.porcentajeCompletado} color="#22d3a5" size={108} />
              <div className="absolute text-center">
                <div className="text-lg font-black text-white">{progress.porcentajeCompletado.toFixed(0)}%</div>
                <div className="text-[9px] uppercase tracking-widest text-slate-500">meta</div>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="text-sm font-semibold text-slate-200">Progreso hacia objetivo</div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-600">Inicial</div>
                  <div className="font-mono text-base font-bold text-slate-400">{progress.pesoInicial.toFixed(1)} kg</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-600">Actual</div>
                  <div className="font-mono text-lg font-black text-white">{progress.pesoActual.toFixed(1)} kg</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-600">Objetivo</div>
                  <div className="font-mono text-base font-bold text-emerald-400">{progress.pesoObjetivo.toFixed(1)} kg</div>
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progress.porcentajeCompletado}%`, background: "linear-gradient(90deg, #22d3a5, #22e6ff)" }}
                />
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-emerald-400">▼ {progress.perdido.toFixed(1)} kg perdidos</span>
                <span className="text-slate-600">Faltan {progress.faltante.toFixed(1)} kg</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Stats del último scan */}
      {latest && (
        <div>
          <div className="mb-3 text-[11px] uppercase tracking-widest text-slate-500">
            Última medición · {latest.date}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <StatPill label="IMC"           value={latest.imc}                    unit=""     color={imcCol}   icon={Scale}      />
            <StatPill label="Grasa corporal" value={latest.grasa_corporal_pct}    unit="%"    color="#f59e0b"  icon={TrendingDown}/>
            <StatPill label="Masa muscular" value={latest.masa_musculoesqueletica_kg} unit="kg" color="#22d3a5" icon={TrendingUp} />
            <StatPill label="Agua corporal" value={latest.agua_corporal_pct}      unit="%"    color="#60a5fa"  icon={Droplets}    />
            <StatPill label="Grasa visceral" value={latest.grasa_visceral_nivel}  unit=" niv" color="#f43f5e"  icon={Activity}    />
            <StatPill label="TMB"           value={latest.tasa_metabolica_basal_kcal} unit=" kcal" color="#a78bfa" icon={Zap}     />
          </div>
          {latest.imc && (
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/[0.05] px-3 py-2">
              <div className="h-2 w-2 rounded-full" style={{ background: imcCol }} />
              <span className="text-xs text-slate-400">
                IMC {latest.imc} — <span style={{ color: imcCol }}>{imcLabel(latest.imc)}</span>
                {latest.clasificacion_imc ? ` (${latest.clasificacion_imc})` : ""}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Gráficos de progreso */}
      {scans.length >= 2 && (
        <div>
          <div className="mb-3 text-[11px] uppercase tracking-widest text-slate-500">
            Evolución — {scans.length} mediciones
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {CHART_METRICS.map(m => {
              const series = chartSeries(scans, m.key);
              return series.length >= 2 ? (
                <MiniChart key={m.key} data={series} color={m.color} label={m.label} unit={m.unit} />
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Historial */}
      {scans.length > 0 && (
        <Card>
          <div className="mb-4 text-[11px] uppercase tracking-widest text-slate-500">
            Historial · {scans.length} mediciones
          </div>
          <div className="space-y-2">
            {scans.map((s, i) => (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 py-2.5"
              >
                {i === 0 && (
                  <div className="shrink-0 rounded-md border border-cyan-400/25 bg-cyan-400/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-cyan-400">
                    último
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3">
                    {s.peso_kg && (
                      <span className="font-mono text-base font-black text-white">{s.peso_kg} kg</span>
                    )}
                    {s.grasa_corporal_pct && (
                      <span className="text-xs text-slate-500">Grasa {s.grasa_corporal_pct}%</span>
                    )}
                    {s.imc && (
                      <span className="text-xs" style={{ color: imcColor(s.imc) }}>IMC {s.imc}</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-600">{s.date}</div>
                </div>
                <button
                  onClick={() => handleRemove(s.id)}
                  className="text-slate-700 transition-colors hover:text-red-400"
                >
                  <Trash2 size={13} />
                </button>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty state */}
      {scans.length === 0 && (
        <div className="py-6 text-center text-sm text-slate-600">
          Sube tu primera captura para comenzar el seguimiento.
        </div>
      )}
    </div>
  );
}
