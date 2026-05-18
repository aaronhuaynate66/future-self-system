import type { AppState } from "@/types";

export const INITIAL_STATE: AppState = {
  schemaVersion: 3,
  dailyLogs: [],
  top3: {
    date: new Date().toISOString().slice(0, 10),
    tasks: [],
  },
  finance: {
    monthlyIncomeGoal: 10000,
    currentMonthIncome: 0,
    recurringClients: 0,
    weeklyMeetings: 0,
    proposalsSent: 0,
    cashAvailable: 0,
  },
  health: {
    weightKg: 83.05,
    bmi: 26.8,
    bodyFatPct: 26.1,
    skeletalMuscleKg: 33.4,
    bodyWaterPct: 48.6,
    visceralFat: 12,
    fatFreeMassKg: 61.4,
    restingHr: 108,
    bmrKcal: 1751,
    visa: "not_started",
    flight: "not_started",
    registration: "not_started",
    travelSavingsUsd: 0,
    travelSavingsGoalUsd: 2000,
  },
  projects: [],
};
