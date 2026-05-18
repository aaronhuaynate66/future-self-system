// ============================================================
// AARON OS v2 — Financial OS logic
// ============================================================

import type {
  Transaction,
  MonthlyBudget,
  FinancialAlert,
  FinancialOS,
  TransactionType,
  FinanceCategory,
  SpendingIntent,
} from "@/types";

// ────────────────────────────────────────────────────────────
// STORAGE
// ────────────────────────────────────────────────────────────

const STORAGE_KEY = "aaron_financial_os";

export function loadFinancialOS(): FinancialOS {
  if (typeof window === "undefined") return { transactions: [], budgets: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { transactions: [], budgets: [] };
    return JSON.parse(raw) as FinancialOS;
  } catch {
    return { transactions: [], budgets: [] };
  }
}

export function saveFinancialOS(data: FinancialOS): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ────────────────────────────────────────────────────────────
// CRUD TRANSACTIONS
// ────────────────────────────────────────────────────────────

export function addTransaction(
  data: FinancialOS,
  tx: Omit<Transaction, "id">
): FinancialOS {
  const newTx: Transaction = { ...tx, id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
  return { ...data, transactions: [newTx, ...data.transactions] };
}

export function removeTransaction(data: FinancialOS, id: string): FinancialOS {
  return { ...data, transactions: data.transactions.filter(t => t.id !== id) };
}

// ────────────────────────────────────────────────────────────
// MONTHLY SUMMARIES
// ────────────────────────────────────────────────────────────

export interface MonthlySummary {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  totalSaving: number;
  cashflow: number;
  runway: number;          // meses de runway con el ahorro actual
  byIntent: Record<SpendingIntent, number>;
  byCategory: Partial<Record<FinanceCategory, number>>;
  financialScore: number;  // 0–100
  alerts: FinancialAlert[];
}

export function summarizeMonth(data: FinancialOS, month: string): MonthlySummary {
  const txs = data.transactions.filter(t => t.date.startsWith(month));
  const budget = data.budgets.find(b => b.month === month);

  const totalIncome   = txs.filter(t => t.type === "income")  .reduce((s, t) => s + t.amount, 0);
  const totalExpenses = txs.filter(t => t.type === "expense") .reduce((s, t) => s + t.amount, 0);
  const totalSaving   = txs.filter(t => t.type === "saving")  .reduce((s, t) => s + t.amount, 0);
  const cashflow      = totalIncome - totalExpenses - totalSaving;

  // Acumulado de ahorro total para runway
  const allSaving = data.transactions
    .filter(t => t.type === "saving")
    .reduce((s, t) => s + t.amount, 0);
  const avgMonthlyExpense = totalExpenses || 1;
  const runway = allSaving / avgMonthlyExpense;

  const byIntent: Record<SpendingIntent, number> = {
    obligatorio: 0,
    necesario: 0,
    no_esencial: 0,
  };

  const byCategory: Partial<Record<FinanceCategory, number>> = {};

  for (const tx of txs) {
    if (tx.type === "expense") {
      if (tx.intent) byIntent[tx.intent] += tx.amount;
      byCategory[tx.category] = (byCategory[tx.category] ?? 0) + tx.amount;
    }
  }

  // Financial Score
  let score = 100;
  const savingRate = totalIncome > 0 ? totalSaving / totalIncome : 0;
  const nonEssentialRate = totalExpenses > 0 ? byIntent.no_esencial / totalExpenses : 0;

  if (savingRate < 0.10) score -= 25;
  else if (savingRate < 0.20) score -= 10;
  if (nonEssentialRate > 0.30) score -= 20;
  else if (nonEssentialRate > 0.20) score -= 10;
  if (cashflow < 0) score -= 30;
  if (totalIncome < (budget?.incomeGoal ?? 0) * 0.8) score -= 15;

  score = Math.max(0, Math.min(100, score));

  // Alerts
  const alerts: FinancialAlert[] = [];
  const prevMonth = getPrevMonth(month);
  const prevTxs   = data.transactions.filter(t => t.date.startsWith(prevMonth));
  const prevDelivery = prevTxs
    .filter(t => t.category === "delivery")
    .reduce((s, t) => s + t.amount, 0);
  const currDelivery = byCategory["delivery"] ?? 0;

  if (prevDelivery > 0 && currDelivery > prevDelivery * 1.3) {
    alerts.push({
      id: "delivery_spike",
      level: "warning",
      message: `Delivery aumentó ${Math.round((currDelivery / prevDelivery - 1) * 100)}% vs mes anterior`,
      createdAt: new Date().toISOString(),
    });
  }

  if (nonEssentialRate > 0.3) {
    alerts.push({
      id: "non_essential_high",
      level: "warning",
      message: `Gasto no esencial elevado: ${Math.round(nonEssentialRate * 100)}% del total`,
      createdAt: new Date().toISOString(),
    });
  }

  if (cashflow < 0) {
    alerts.push({
      id: "negative_cashflow",
      level: "critical",
      message: `Cashflow negativo: -S/${Math.abs(cashflow).toFixed(0)}`,
      createdAt: new Date().toISOString(),
    });
  }

  if (savingRate < 0.05 && totalIncome > 0) {
    alerts.push({
      id: "low_saving",
      level: "warning",
      message: `Tasa de ahorro baja: ${Math.round(savingRate * 100)}%`,
      createdAt: new Date().toISOString(),
    });
  }

  return {
    month, totalIncome, totalExpenses, totalSaving,
    cashflow, runway, byIntent, byCategory,
    financialScore: score, alerts,
  };
}

function getPrevMonth(yyyyMm: string): string {
  const [y, m] = yyyyMm.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ────────────────────────────────────────────────────────────
// CATEGORY META
// ────────────────────────────────────────────────────────────

export const CATEGORY_META: Record<FinanceCategory, { label: string; intent: SpendingIntent | null; emoji: string }> = {
  sueldo:         { label: "Sueldo",          intent: null,           emoji: "💼" },
  freelance:      { label: "Freelance",        intent: null,           emoji: "🧠" },
  clases:         { label: "Clases",           intent: null,           emoji: "🎓" },
  otro_ingreso:   { label: "Otro ingreso",     intent: null,           emoji: "💰" },
  vivienda:       { label: "Vivienda",         intent: "obligatorio",  emoji: "🏠" },
  servicios:      { label: "Servicios",        intent: "obligatorio",  emoji: "⚡" },
  alimentacion:   { label: "Alimentación",     intent: "necesario",    emoji: "🍽️" },
  transporte:     { label: "Transporte",       intent: "necesario",    emoji: "🚗" },
  salud:          { label: "Salud",            intent: "necesario",    emoji: "💊" },
  gym:            { label: "Gym",              intent: "necesario",    emoji: "🏋️" },
  educacion:      { label: "Educación",        intent: "necesario",    emoji: "📚" },
  delivery:       { label: "Delivery",         intent: "no_esencial",  emoji: "📦" },
  entretenimiento:{ label: "Entretenimiento",  intent: "no_esencial",  emoji: "🎬" },
  ropa:           { label: "Ropa",             intent: "no_esencial",  emoji: "👕" },
  hormiga:        { label: "Gasto hormiga",    intent: "no_esencial",  emoji: "🐜" },
  ahorro:         { label: "Ahorro",           intent: null,           emoji: "🏦" },
  inversion:      { label: "Inversión",        intent: null,           emoji: "📈" },
  otro:           { label: "Otro",             intent: "no_esencial",  emoji: "❓" },
};

export const INCOME_CATEGORIES: FinanceCategory[]  = ["sueldo", "freelance", "clases", "otro_ingreso"];
export const EXPENSE_CATEGORIES: FinanceCategory[] = [
  "vivienda", "servicios", "alimentacion", "transporte", "salud", "gym",
  "educacion", "delivery", "entretenimiento", "ropa", "hormiga", "otro",
];
export const SAVING_CATEGORIES: FinanceCategory[]  = ["ahorro", "inversion"];

export const INTENT_META: Record<SpendingIntent, { label: string; color: string; bg: string }> = {
  obligatorio: { label: "Obligatorio", color: "#f43f5e", bg: "rgba(244,63,94,0.10)"  },
  necesario:   { label: "Necesario",   color: "#fbbf24", bg: "rgba(251,191,36,0.10)" },
  no_esencial: { label: "No esencial", color: "#64748b", bg: "rgba(100,116,139,0.10)" },
};
