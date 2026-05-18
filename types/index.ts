// ============================================================
// AARON OS v2 — TYPES
// ============================================================

// ---------- DAILY LOG ----------
export type PeaceFlag = "verde" | "amarillo" | "rojo";
export type SleepFlag = "bien" | "regular" | "mal";

export interface DailyLog {
  id: string;
  date: string; // yyyy-mm-dd
  trained: boolean;
  checkedDashboard: boolean;
  commercialMove: boolean;
  peace: PeaceFlag;
  sleep: SleepFlag;
  migraine: boolean;
  argued: boolean;
  note: string;
}

// ---------- ESTADO OPERATIVO ----------
export type OperationalStatus =
  | "LOCKED_IN"
  | "FOCUSED"
  | "OPERATIONAL"
  | "UNSTABLE"
  | "REACTIVE";

// Recovery Mode se activa cuando el score baja mucho
export type SystemMode = "NORMAL" | "RECOVERY";

// ---------- HORARIO ----------
export type DayKey = "lun" | "mar" | "mie" | "jue" | "vie" | "sab" | "dom";

export type ActivityKind =
  | "wake"
  | "gym"
  | "transition"
  | "check"
  | "work"
  | "commute"
  | "classes"
  | "projects"
  | "commercial"
  | "deep"
  | "rest"
  | "review"
  | "shutdown"
  | "sleep";

export interface ScheduleBlock {
  start: string; // "HH:mm"
  end: string;
  kind: ActivityKind;
  label: string;
  detail?: string;
}

export type WeekSchedule = Record<DayKey, ScheduleBlock[]>;

// ---------- TOP 3 ----------
export interface TopTask {
  id: string;
  text: string;
  done: boolean;
}

export interface Top3State {
  date: string;
  tasks: TopTask[];
}

// ---------- SCORE SEMANAL ----------
export type Tier = "S" | "A" | "B" | "C" | "D";

export interface WeekScore {
  weekStart: string;
  weekEnd: string;
  days: DailyLog[];
  score: number;
  tier: Tier;
  breakdown: {
    trained: number;
    checkedDashboard: number;
    commercialMove: number;
    peaceVerde: number;
    sleepBien: number;
    migraines: number;
    arguments: number;
  };
  alerts: string[];
  daysLogged: number;
}

// ---------- CONTEXTO SECUNDARIO ----------
export interface FinanceState {
  monthlyIncomeGoal: number;
  currentMonthIncome: number;
  recurringClients: number;
  weeklyMeetings: number;
  proposalsSent: number;
  cashAvailable: number;
}

export type LogisticsStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "approved"
  | "done";

export interface HealthState {
  weightKg: number;
  bmi: number;
  bodyFatPct: number;
  skeletalMuscleKg: number;
  bodyWaterPct: number;
  visceralFat: number;
  fatFreeMassKg: number;
  restingHr: number;
  bmrKcal: number;
  visa: LogisticsStatus;
  flight: LogisticsStatus;
  registration: LogisticsStatus;
  travelSavingsUsd: number;
  travelSavingsGoalUsd: number;
}

export type ProjectStatus = "idea" | "active" | "blocked" | "paused" | "done";

export interface Project {
  id: string;
  name: string;
  objective: string;
  status: ProjectStatus;
  progress: number;
  nextAction: string;
  blocker: string;
  updatedAt: string;
}

// ---------- APP STATE ----------
export interface AppState {
  schemaVersion: number;
  dailyLogs: DailyLog[];
  top3: Top3State;
  finance: FinanceState;
  health: HealthState;
  projects: Project[];
}

// ============================================================
// FINANCIAL OS
// ============================================================

export type TransactionType = "income" | "expense" | "saving";

export type SpendingIntent = "obligatorio" | "necesario" | "no_esencial";

export type FinanceCategory =
  | "sueldo"
  | "freelance"
  | "clases"
  | "otro_ingreso"
  | "vivienda"
  | "servicios"
  | "alimentacion"
  | "transporte"
  | "salud"
  | "gym"
  | "educacion"
  | "delivery"
  | "entretenimiento"
  | "ropa"
  | "hormiga"
  | "ahorro"
  | "inversion"
  | "otro";

export interface Transaction {
  id: string;
  date: string;           // yyyy-mm-dd
  amount: number;         // en PEN
  type: TransactionType;
  category: FinanceCategory;
  intent: SpendingIntent | null; // solo para expenses
  note: string;
}

export interface MonthlyBudget {
  month: string;          // yyyy-mm
  incomeGoal: number;
  savingGoal: number;
  categories: Partial<Record<FinanceCategory, number>>;
}

export interface FinancialAlert {
  id: string;
  level: "info" | "warning" | "critical";
  message: string;
  createdAt: string;
}

export interface FinancialOS {
  transactions: Transaction[];
  budgets: MonthlyBudget[];
}
