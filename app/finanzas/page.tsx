"use client";

import { useAppState } from "@/lib/state";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatPEN } from "@/lib/utils";

export default function FinanzasPage() {
  const { state, dispatch } = useAppState();
  const f = state.finance;
  const progress = Math.min(100, (f.currentMonthIncome / Math.max(1, f.monthlyIncomeGoal)) * 100);

  function set(patch: Partial<typeof f>) {
    dispatch({ type: "SET_FINANCE", payload: patch });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <div className="text-[11px] uppercase tracking-[0.4em] text-slate-600">Contexto · Capital</div>
        <h1 className="mt-1 text-2xl font-semibold text-slate-100">Finanzas</h1>
      </div>

      <Card title="Ingreso del mes" hint={`Meta ${formatPEN(f.monthlyIncomeGoal)}`}>
        <div className="flex items-end justify-between">
          <div className="font-mono text-3xl text-glow tabular">{formatPEN(f.currentMonthIncome)}</div>
          <div className="text-[11px] uppercase tracking-widest text-slate-600">{Math.round(progress)}%</div>
        </div>
        <ProgressBar
          value={progress}
          tone={progress >= 80 ? "green" : progress >= 40 ? "cyan" : "amber"}
          className="mt-4"
        />
      </Card>

      <Card title="Inputs" hint="Editar">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { label: "Ingreso del mes (S/)", key: "currentMonthIncome" },
            { label: "Meta mensual (S/)", key: "monthlyIncomeGoal" },
            { label: "Clientes recurrentes", key: "recurringClients" },
            { label: "Reuniones / semana", key: "weeklyMeetings" },
            { label: "Propuestas enviadas", key: "proposalsSent" },
            { label: "Dinero disponible (S/)", key: "cashAvailable" },
          ].map(({ label, key }) => (
            <label key={key} className="block">
              <span className="mb-1 block text-[10px] uppercase tracking-widest text-slate-600">{label}</span>
              <input
                type="number"
                value={(f as any)[key]}
                min={0}
                onChange={(e) => set({ [key]: Number(e.target.value) || 0 })}
              />
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
}
