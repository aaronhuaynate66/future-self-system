"use client";

import { useEffect, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { useAppState } from "@/lib/state";
import { todayIso } from "@/lib/dates";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { DailyLog, PeaceFlag, SleepFlag } from "@/types";
import { cn } from "@/lib/utils";

const EMPTY: DailyLog = {
  id: "",
  date: "",
  trained: false,
  checkedDashboard: false,
  commercialMove: false,
  peace: "amarillo",
  sleep: "regular",
  migraine: false,
  argued: false,
  note: "",
};

function ToggleRow({
  label,
  value,
  onChange,
  color = "#22d3a5",
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.05] px-4 py-3">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(true)}
          className="rounded-lg border px-3 py-1 text-[11px] uppercase tracking-widest transition-all"
          style={{
            borderColor: value ? color + "50" : "rgba(255,255,255,0.06)",
            background: value ? color + "14" : "transparent",
            color: value ? color : "#64748b",
          }}
        >
          Sí
        </button>
        <button
          onClick={() => onChange(false)}
          className="rounded-lg border px-3 py-1 text-[11px] uppercase tracking-widest transition-all"
          style={{
            borderColor: !value ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
            background: !value ? "rgba(255,255,255,0.04)" : "transparent",
            color: !value ? "#94a3b8" : "#475569",
          }}
        >
          No
        </button>
      </div>
    </div>
  );
}

function FlagPicker({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; color: string }[];
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.05] px-4 py-3">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="flex gap-2">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              onClick={() => onChange(o.value)}
              className="rounded-lg border px-3 py-1 text-[11px] uppercase tracking-widest transition-all"
              style={{
                borderColor: active ? o.color + "50" : "rgba(255,255,255,0.06)",
                background: active ? o.color + "14" : "transparent",
                color: active ? o.color : "#64748b",
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function RegistroPage() {
  const { state, dispatch } = useAppState();
  const [date, setDate] = useState(todayIso());
  const [draft, setDraft] = useState<DailyLog>({ ...EMPTY, date: todayIso() });

  useEffect(() => {
    const existing = state.dailyLogs.find((l) => l.date === date);
    setDraft(existing ?? { ...EMPTY, date });
  }, [date, state.dailyLogs]);

  function update(patch: Partial<DailyLog>) {
    setDraft((d) => ({ ...d, ...patch }));
  }

  function save() {
    dispatch({ type: "UPSERT_DAILY_LOG", payload: { ...draft, date } });
  }

  function remove() {
    if (!draft.id) return;
    dispatch({ type: "REMOVE_DAILY_LOG", payload: { id: draft.id } });
    setDraft({ ...EMPTY, date });
  }

  const existing = !!state.dailyLogs.find((l) => l.date === date);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <div className="text-[11px] uppercase tracking-[0.4em] text-slate-600">
          Aaron OS · Input diario
        </div>
        <h1 className="mt-1 text-2xl font-semibold text-slate-100">Registro</h1>
        <p className="mt-1 text-sm text-slate-600">
          Tres minutos. Cinco campos. El sistema vive de esto.
        </p>
      </div>

      <Card title="Día" hint={existing ? "Editando" : "Nuevo"}>
        <div className="space-y-3">
          {/* Fecha */}
          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-widest text-slate-600">
              Fecha
            </span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>

          {/* Checks booleanos */}
          <ToggleRow
            label="Entrené"
            value={draft.trained}
            onChange={(v) => update({ trained: v })}
            color="#22d3a5"
          />
          <ToggleRow
            label="Revisé dashboard"
            value={draft.checkedDashboard}
            onChange={(v) => update({ checkedDashboard: v })}
            color="#22e6ff"
          />
          <ToggleRow
            label="Movimiento comercial"
            value={draft.commercialMove}
            onChange={(v) => update({ commercialMove: v })}
            color="#2dd4bf"
          />
          <ToggleRow
            label="Migraña"
            value={draft.migraine}
            onChange={(v) => update({ migraine: v })}
            color="#f43f5e"
          />
          <ToggleRow
            label="Discusiones tontas"
            value={draft.argued}
            onChange={(v) => update({ argued: v })}
            color="#fbbf24"
          />

          {/* Flags */}
          <FlagPicker
            label="Paz mental"
            value={draft.peace}
            onChange={(v) => update({ peace: v as PeaceFlag })}
            options={[
              { value: "verde",    label: "Verde",    color: "#22d3a5" },
              { value: "amarillo", label: "Amarillo", color: "#fbbf24" },
              { value: "rojo",     label: "Rojo",     color: "#f43f5e" },
            ]}
          />
          <FlagPicker
            label="Sueño"
            value={draft.sleep}
            onChange={(v) => update({ sleep: v as SleepFlag })}
            options={[
              { value: "bien",    label: "Bien",    color: "#22d3a5" },
              { value: "regular", label: "Regular", color: "#fbbf24" },
              { value: "mal",     label: "Mal",     color: "#f43f5e" },
            ]}
          />

          {/* Nota */}
          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-widest text-slate-600">
              Nota del día
            </span>
            <textarea
              rows={3}
              placeholder="Una línea honesta. ¿Qué pasó, qué hizo ruido, qué protegió la paz?"
              value={draft.note}
              onChange={(e) => update({ note: e.target.value })}
            />
          </label>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Button variant="danger" size="sm" disabled={!existing} onClick={remove}>
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </Button>
          <Button variant="primary" size="md" onClick={save}>
            <Save className="h-3.5 w-3.5" />
            Guardar registro
          </Button>
        </div>
      </Card>

      {/* Últimos registros */}
      {state.dailyLogs.length > 0 && (
        <Card title="Historial" hint={`${state.dailyLogs.length} días`}>
          <div className="space-y-1.5">
            {state.dailyLogs.slice(0, 10).map((l) => {
              const peaceColor = { verde: "#22d3a5", amarillo: "#fbbf24", rojo: "#f43f5e" }[l.peace];
              return (
                <div
                  key={l.id}
                  className="flex items-center justify-between rounded-lg border border-white/[0.04] px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-slate-500 tabular">{l.date}</span>
                    <div className="flex gap-1.5">
                      {l.trained && <span className="text-[10px] text-activity-gym">gym</span>}
                      {l.commercialMove && <span className="text-[10px] text-activity-commercial">$</span>}
                      {l.migraine && <span className="text-[10px] text-signal-red">⚡</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ background: peaceColor }}
                    />
                    <button
                      onClick={() =>
                        dispatch({ type: "REMOVE_DAILY_LOG", payload: { id: l.id } })
                      }
                      className="text-slate-700 hover:text-signal-red"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
