"use client";

import { useAppState } from "@/lib/state";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatUSD } from "@/lib/utils";
import type { LogisticsStatus } from "@/types";

const STATUS_OPTIONS: { value: LogisticsStatus; label: string }[] = [
  { value: "not_started", label: "No iniciado" },
  { value: "in_progress", label: "En proceso" },
  { value: "submitted",   label: "Enviado" },
  { value: "approved",    label: "Aprobado" },
  { value: "done",        label: "Completado" },
];

const STATUS_COLORS: Record<LogisticsStatus, string> = {
  not_started: "#475569",
  in_progress: "#fbbf24",
  submitted:   "#7df3ff",
  approved:    "#22d3a5",
  done:        "#22d3a5",
};

export default function MundialPage() {
  const { state, dispatch } = useAppState();
  const h = state.health;
  const savings = Math.min(100, (h.travelSavingsUsd / Math.max(1, h.travelSavingsGoalUsd)) * 100);

  function set(patch: Partial<typeof h>) {
    dispatch({ type: "SET_HEALTH", payload: patch });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <div className="text-[11px] uppercase tracking-[0.4em] text-slate-600">Contexto · Misión física</div>
        <h1 className="mt-1 text-2xl font-semibold text-slate-100">Mundial · Nov 2026</h1>
      </div>

      {/* Logística */}
      <Card title="Logística" hint="Estados">
        <div className="grid gap-3 md:grid-cols-3">
          {(["visa", "flight", "registration"] as const).map((key) => {
            const labels = { visa: "Visa", flight: "Pasaje", registration: "Inscripción" };
            return (
              <div key={key} className="rounded-xl border border-white/[0.05] p-3">
                <div className="mb-2 text-[10px] uppercase tracking-widest text-slate-600">{labels[key]}</div>
                <div
                  className="mb-2 text-xs font-medium uppercase tracking-wide"
                  style={{ color: STATUS_COLORS[h[key]] }}
                >
                  {h[key].replace("_", " ")}
                </div>
                <select
                  value={h[key]}
                  onChange={(e) => set({ [key]: e.target.value as LogisticsStatus })}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Ahorro */}
      <Card title="Ahorro de viaje" hint="USD 2,000">
        <div className="flex items-end justify-between">
          <div className="font-mono text-3xl text-glow tabular">{formatUSD(h.travelSavingsUsd)}</div>
          <div className="text-[11px] uppercase tracking-widest text-slate-600">de {formatUSD(h.travelSavingsGoalUsd)}</div>
        </div>
        <ProgressBar value={savings} tone={savings >= 100 ? "green" : "cyan"} className="mt-4" />
        <label className="mt-3 block">
          <span className="mb-1 block text-[10px] uppercase tracking-widest text-slate-600">Ahorrado (USD)</span>
          <input type="number" min={0} value={h.travelSavingsUsd}
            onChange={(e) => set({ travelSavingsUsd: Number(e.target.value) || 0 })} />
        </label>
      </Card>

      {/* Baseline */}
      <Card title="Baseline corporal" hint="Referencia">
        <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
          {[
            { label: "Peso kg", key: "weightKg", step: 0.05 },
            { label: "IMC", key: "bmi", step: 0.1 },
            { label: "Grasa %", key: "bodyFatPct", step: 0.1 },
            { label: "Musc kg", key: "skeletalMuscleKg", step: 0.1 },
            { label: "FC rep", key: "restingHr", step: 1 },
          ].map(({ label, key, step }) => (
            <label key={key} className="block">
              <span className="mb-1 block text-[9px] uppercase tracking-widest text-slate-700">{label}</span>
              <input
                type="number"
                step={step}
                value={(h as any)[key]}
                onChange={(e) => set({ [key]: Number(e.target.value) || 0 })}
              />
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
}
