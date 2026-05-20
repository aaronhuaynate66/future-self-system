"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, DollarSign, PiggyBank,
  AlertTriangle, Plus, Trash2, X, CheckCircle2,
} from "lucide-react";
import {
  loadFinancialOS, saveFinancialOS, addTransaction, removeTransaction,
  summarizeMonth, currentMonth, CATEGORY_META, INTENT_META,
  INCOME_CATEGORIES, EXPENSE_CATEGORIES, SAVING_CATEGORIES,
} from "@/lib/finance";
import type {
  FinancialOS, Transaction, FinanceCategory, TransactionType, SpendingIntent,
} from "@/types";
import { Card } from "@/components/ui/Card";
import { dbLoadTransactions, dbSaveTransaction, dbDeleteTransaction } from "@/lib/db";
import { Button } from "@/components/ui/Button";

// ────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `S/${n.toLocaleString("es-PE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// ────────────────────────────────────────────────────────────
// SCORE BADGE
// ────────────────────────────────────────────────────────────

function FinancialScoreBadge({ score }: { score: number }) {
  const tier = score >= 90 ? "S" : score >= 75 ? "A" : score >= 60 ? "B" : score >= 45 ? "C" : "D";
  const colors: Record<string, string> = {
    S: "#22d3a5", A: "#22e6ff", B: "#fbbf24", C: "#f97316", D: "#f43f5e",
  };
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="text-4xl font-black tabular-nums"
        style={{ color: colors[tier], textShadow: `0 0 24px ${colors[tier]}88` }}
      >
        {score}
      </div>
      <div className="text-xs font-bold tracking-widest uppercase" style={{ color: colors[tier] }}>
        {tier} Tier
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// METRIC CARD
// ────────────────────────────────────────────────────────────

function Metric({
  label, value, sub, color, icon: Icon,
}: {
  label: string; value: string; sub?: string; color: string; icon: React.ElementType;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="mt-0.5 rounded-xl p-2" style={{ background: `${color}18` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-widest text-slate-500">{label}</div>
        <div className="mt-0.5 text-lg font-bold" style={{ color }}>{value}</div>
        {sub && <div className="text-[11px] text-slate-500">{sub}</div>}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// INTENT BAR
// ────────────────────────────────────────────────────────────

function IntentBar({ byIntent, total }: { byIntent: Record<SpendingIntent, number>; total: number }) {
  const intents: SpendingIntent[] = ["obligatorio", "necesario", "no_esencial"];
  return (
    <div>
      <div className="mb-3 text-xs uppercase tracking-widest text-slate-500">Gasto por intención</div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/[0.04]">
        {intents.map(i => {
          const w = total > 0 ? (byIntent[i] / total) * 100 : 0;
          return (
            <div
              key={i}
              style={{ width: `${w}%`, background: INTENT_META[i].color }}
              className="transition-all"
            />
          );
        })}
      </div>
      <div className="mt-3 flex gap-4">
        {intents.map(i => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ background: INTENT_META[i].color }} />
            <span className="text-[11px] text-slate-400">
              {INTENT_META[i].label}: {total > 0 ? Math.round((byIntent[i] / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// FORM MODAL
// ────────────────────────────────────────────────────────────

interface FormState {
  type: TransactionType;
  amount: string;
  category: FinanceCategory;
  intent: SpendingIntent | null;
  date: string;
  note: string;
}

function TransactionForm({
  onAdd,
  onClose,
}: {
  onAdd: (tx: Omit<Transaction, "id">) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>({
    type: "expense",
    amount: "",
    category: "alimentacion",
    intent: "necesario",
    date: today(),
    note: "",
  });

  const cats =
    form.type === "income"
      ? INCOME_CATEGORIES
      : form.type === "saving"
      ? SAVING_CATEGORIES
      : EXPENSE_CATEGORIES;

  function handleTypeChange(t: TransactionType) {
    const defaultCat =
      t === "income" ? "sueldo" : t === "saving" ? "ahorro" : "alimentacion";
    const defaultIntent: SpendingIntent | null =
      t === "expense" ? (CATEGORY_META[defaultCat]?.intent ?? "necesario") : null;
    setForm(f => ({ ...f, type: t, category: defaultCat, intent: defaultIntent }));
  }

  function handleCatChange(cat: FinanceCategory) {
    const meta = CATEGORY_META[cat];
    setForm(f => ({ ...f, category: cat, intent: form.type === "expense" ? (meta.intent ?? "necesario") : null }));
  }

  function handleSubmit() {
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return;
    onAdd({
      date: form.date,
      amount,
      type: form.type,
      category: form.category,
      intent: form.type === "expense" ? form.intent : null,
      note: form.note,
    });
    onClose();
  }

  const typeColors: Record<TransactionType, string> = {
    income: "#22d3a5", expense: "#f43f5e", saving: "#22e6ff",
  };
  const typeLabels: Record<TransactionType, string> = {
    income: "Ingreso", expense: "Gasto", saving: "Ahorro",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#0d1825] p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="text-sm font-semibold uppercase tracking-widest text-slate-300">
            Nueva transacción
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={18} />
          </button>
        </div>

        {/* Tipo */}
        <div className="mb-4 flex gap-2">
          {(["income", "expense", "saving"] as TransactionType[]).map(t => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className="flex-1 rounded-xl border py-2 text-xs font-bold uppercase tracking-widest transition-all"
              style={{
                borderColor: form.type === t ? typeColors[t] : "rgba(255,255,255,0.06)",
                background:  form.type === t ? `${typeColors[t]}18` : "transparent",
                color:       form.type === t ? typeColors[t] : "#64748b",
              }}
            >
              {typeLabels[t]}
            </button>
          ))}
        </div>

        {/* Monto */}
        <div className="mb-3">
          <label className="mb-1 block text-[11px] uppercase tracking-widest text-slate-500">
            Monto (S/)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-lg font-bold text-white placeholder-slate-600 focus:border-cyan-400/40 focus:outline-none"
          />
        </div>

        {/* Categoría */}
        <div className="mb-3">
          <label className="mb-1 block text-[11px] uppercase tracking-widest text-slate-500">
            Categoría
          </label>
          <select
            value={form.category}
            onChange={e => handleCatChange(e.target.value as FinanceCategory)}
            className="w-full rounded-xl border border-white/[0.08] bg-[#0d1825] px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:outline-none"
          >
            {cats.map(c => (
              <option key={c} value={c}>
                {CATEGORY_META[c].emoji} {CATEGORY_META[c].label}
              </option>
            ))}
          </select>
        </div>

        {/* Intent (solo gastos) */}
        {form.type === "expense" && (
          <div className="mb-3">
            <label className="mb-1 block text-[11px] uppercase tracking-widest text-slate-500">
              Intención
            </label>
            <div className="flex gap-2">
              {(["obligatorio", "necesario", "no_esencial"] as SpendingIntent[]).map(i => (
                <button
                  key={i}
                  onClick={() => setForm(f => ({ ...f, intent: i }))}
                  className="flex-1 rounded-xl border py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all"
                  style={{
                    borderColor: form.intent === i ? INTENT_META[i].color : "rgba(255,255,255,0.06)",
                    background:  form.intent === i ? INTENT_META[i].bg : "transparent",
                    color:       form.intent === i ? INTENT_META[i].color : "#64748b",
                  }}
                >
                  {INTENT_META[i].label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fecha */}
        <div className="mb-3">
          <label className="mb-1 block text-[11px] uppercase tracking-widest text-slate-500">Fecha</label>
          <input
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="w-full rounded-xl border border-white/[0.08] bg-[#0d1825] px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:outline-none"
          />
        </div>

        {/* Nota */}
        <div className="mb-5">
          <label className="mb-1 block text-[11px] uppercase tracking-widest text-slate-500">Nota</label>
          <input
            type="text"
            placeholder="Opcional"
            value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-cyan-400/40 focus:outline-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 py-3 text-sm font-bold text-cyan-300 transition-all hover:bg-cyan-400/20"
        >
          <CheckCircle2 size={16} />
          Registrar
        </button>
      </motion.div>
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────
// MAIN PAGE
// ────────────────────────────────────────────────────────────

export default function FinancialOSPage() {
  const [data, setData] = useState<FinancialOS>({ transactions: [], budgets: [] });
  const [showForm, setShowForm] = useState(false);
  const [mounted, setMounted] = useState(false);

  const month = currentMonth();

  useEffect(() => {
    dbLoadTransactions().then(remote => {
      const local = loadFinancialOS();
      // Si no hay presupuesto, crear uno con datos reales
      if (local.budgets.length === 0) {
        const currentMonth = new Date().toISOString().slice(0, 7);
        local.budgets = [{
          month: currentMonth,
          incomeGoal: 15000,   // Meta S/ 15,000/mes
          savingGoal: 2000,
          categories: {
            vivienda:     1120, // Terreno empresa
            servicios:     847, // Seguro Pacífico
            transporte:    656, // Terreno personal
            alimentacion:  800,
            hormiga:       300,
          },
        }];
        saveFinancialOS(local);
      }
      // Si no hay transacciones, pre-cargar datos reales de mayo 2026
      const allTxs = remote.length > 0 ? remote : local.transactions;
      if (allTxs.length === 0) {
        const seedTxs = [
          // Ingresos
          { id: "seed-1", date: "2026-05-01", amount: 6173.38, type: "income"  as const, category: "sueldo"   as const, intent: null, note: "Sueldo neto mayo 2026" },
          // Gastos fijos obligatorios
          { id: "seed-2", date: "2026-05-05", amount: 1120.86, type: "expense" as const, category: "vivienda"  as const, intent: "obligatorio" as const, note: "Terreno empresa" },
          { id: "seed-3", date: "2026-05-05", amount:  656.25, type: "expense" as const, category: "transporte" as const, intent: "obligatorio" as const, note: "Terreno personal" },
          { id: "seed-4", date: "2026-05-05", amount:  847.06, type: "expense" as const, category: "salud"     as const, intent: "obligatorio" as const, note: "Seguro Pacífico / MedicVida" },
        ];
        const seeded = { ...local, transactions: seedTxs };
        setData(seeded);
        saveFinancialOS(seeded);
        // Sincronizar seeds a Supabase
        seedTxs.forEach(tx => dbSaveTransaction(tx).catch(console.error));
      } else if (remote.length > 0) {
        const updated = { ...local, transactions: remote };
        setData(updated);
        saveFinancialOS(updated);
      } else {
        setData(local);
      }
      setMounted(true);
    }).catch(() => {
      const local = loadFinancialOS();
      setData(local);
      setMounted(true);
    });
  }, []);

  const summary = useMemo(() => summarizeMonth(data, month), [data, month]);

  function handleAdd(tx: Omit<Transaction, "id">) {
    const updated = addTransaction(data, tx);
    const newTx = updated.transactions[0];
    setData(updated);
    saveFinancialOS(updated);
    dbSaveTransaction(newTx).catch(console.error);
  }

  function handleRemove(id: string) {
    const updated = removeTransaction(data, id);
    setData(updated);
    saveFinancialOS(updated);
    dbDeleteTransaction(id).catch(console.error);
  }

  const recentTxs = data.transactions
    .filter(t => t.date.startsWith(month))
    .slice(0, 15);

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Financial OS</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Control financiero — {new Date().toLocaleString("es-PE", { month: "long", year: "numeric" })}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-2xl border border-cyan-400/25 bg-cyan-400/8 px-4 py-2 text-xs font-bold uppercase tracking-widest text-cyan-400 transition-all hover:bg-cyan-400/15"
        >
          <Plus size={14} />
          Registrar
        </button>
      </div>

      {/* Alerts */}
      {summary.alerts.length > 0 && (
        <div className="space-y-2">
          {summary.alerts.map(a => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-3 rounded-2xl border px-4 py-3"
              style={{
                borderColor: a.level === "critical" ? "rgba(244,63,94,0.25)" : "rgba(251,191,36,0.20)",
                background:  a.level === "critical" ? "rgba(244,63,94,0.06)" : "rgba(251,191,36,0.05)",
              }}
            >
              <AlertTriangle
                size={14}
                className="mt-0.5 shrink-0"
                style={{ color: a.level === "critical" ? "#f43f5e" : "#fbbf24" }}
              />
              <span className="text-xs text-slate-300">{a.message}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Score + Overview */}
      <div className="grid gap-4 sm:grid-cols-[auto,1fr]">
        <Card className="flex flex-col items-center justify-center gap-2 px-8 py-6">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Financial Score</div>
          <FinancialScoreBadge score={summary.financialScore} />
          <div className="mt-2 text-[10px] text-slate-600">
            Runway: {summary.runway.toFixed(1)} meses
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
          <Metric label="Ingresos" value={fmt(summary.totalIncome)}   color="#22d3a5" icon={TrendingUp}   sub={`Meta: ${fmt(data.budgets.find(b => b.month === month)?.incomeGoal ?? 0)}`} />
          <Metric label="Gastos"   value={fmt(summary.totalExpenses)} color="#f43f5e" icon={TrendingDown} />
          <Metric label="Ahorro"   value={fmt(summary.totalSaving)}   color="#22e6ff" icon={PiggyBank} />
          <Metric
            label="Cashflow"
            value={fmt(summary.cashflow)}
            color={summary.cashflow >= 0 ? "#22d3a5" : "#f43f5e"}
            icon={DollarSign}
            sub={summary.cashflow >= 0 ? "Positivo" : "Negativo"}
          />
        </div>
      </div>

      {/* Intent bar */}
      {summary.totalExpenses > 0 && (
        <Card className="px-5 py-4">
          <IntentBar byIntent={summary.byIntent} total={summary.totalExpenses} />
        </Card>
      )}

      {/* Top categorías */}
      {Object.keys(summary.byCategory).length > 0 && (
        <Card>
          <div className="mb-3 text-[11px] uppercase tracking-widest text-slate-500">Top gastos</div>
          <div className="space-y-2">
            {Object.entries(summary.byCategory)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 6)
              .map(([cat, amount]) => {
                const meta = CATEGORY_META[cat as FinanceCategory];
                const pct = summary.totalExpenses > 0 ? (amount / summary.totalExpenses) * 100 : 0;
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="w-5 text-center text-sm">{meta.emoji}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">{meta.label}</span>
                        <span className="font-mono text-slate-400">{fmt(amount)}</span>
                      </div>
                      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/[0.04]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            background: meta.intent ? INTENT_META[meta.intent].color : "#22d3a5",
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-600">{pct.toFixed(0)}%</span>
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      {/* Transacciones recientes */}
      <Card>
        <div className="mb-4 text-[11px] uppercase tracking-widest text-slate-500">
          Transacciones — {new Date().toLocaleString("es-PE", { month: "long" })}
        </div>
        {recentTxs.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-600">
            Sin transacciones registradas.{" "}
            <button onClick={() => setShowForm(true)} className="text-cyan-500 underline">
              Agregar primera
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTxs.map(tx => {
              const meta = CATEGORY_META[tx.category];
              const amtColor =
                tx.type === "income" ? "#22d3a5" : tx.type === "saving" ? "#22e6ff" : "#f43f5e";
              return (
                <motion.div
                  key={tx.id}
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 py-2.5 hover:border-white/[0.08] transition-colors"
                >
                  <span className="text-lg">{meta.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium text-slate-200 truncate">{meta.label}</span>
                      {tx.intent && (
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider px-1.5 rounded-full"
                          style={{ color: INTENT_META[tx.intent].color, background: INTENT_META[tx.intent].bg }}
                        >
                          {tx.intent.replace("_", " ")}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-600">
                      {tx.date}{tx.note ? ` · ${tx.note}` : ""}
                    </div>
                  </div>
                  <span className="font-mono font-bold text-sm shrink-0" style={{ color: amtColor }}>
                    {tx.type === "income" ? "+" : "-"}{fmt(tx.amount)}
                  </span>
                  <button
                    onClick={() => handleRemove(tx.id)}
                    className="text-slate-700 hover:text-signal-red transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modal */}
      <AnimatePresence>
        {showForm && (
          <TransactionForm onAdd={handleAdd} onClose={() => setShowForm(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
