// ============================================================
// AARON OS v2 — Capa de persistencia dual
// localStorage (inmediato) + Supabase (permanente)
// ============================================================

"use client";

import { supabase } from "@/lib/supabase";
import type { BodyScan } from "@/lib/body";
import type { DailyLog } from "@/types";
import type { Transaction } from "@/types";

const USER_ID = "aaron";

// ── BODY SCANS ────────────────────────────────────────────────

export async function dbSaveBodyScan(scan: BodyScan): Promise<void> {
  await supabase.from("body_scans").upsert({
    id: scan.id,
    user_id: USER_ID,
    date: scan.date,
    peso_kg: scan.peso_kg,
    imc: scan.imc,
    clasificacion_imc: scan.clasificacion_imc,
    grasa_corporal_pct: scan.grasa_corporal_pct,
    masa_libre_grasa_kg: scan.masa_libre_grasa_kg,
    agua_corporal_pct: scan.agua_corporal_pct,
    grasa_visceral_nivel: scan.grasa_visceral_nivel,
    masa_osea_kg: scan.masa_osea_kg,
    proteinas_pct: scan.proteinas_pct,
    masa_musculoesqueletica_kg: scan.masa_musculoesqueletica_kg,
    tasa_metabolica_basal_kcal: scan.tasa_metabolica_basal_kcal,
    frecuencia_cardiaca_ppm: scan.frecuencia_cardiaca_ppm,
    peso_objetivo_kg: scan.peso_objetivo_kg,
    peso_inicial_kg: scan.peso_inicial_kg,
    total_perdido_kg: scan.total_perdido_kg,
    source: scan.source ?? "scan",
  });
}

export async function dbDeleteBodyScan(id: string): Promise<void> {
  await supabase.from("body_scans").delete().eq("id", id);
}

export async function dbLoadBodyScans(): Promise<BodyScan[]> {
  const { data, error } = await supabase
    .from("body_scans")
    .select("*")
    .eq("user_id", USER_ID)
    .order("date", { ascending: false });
  if (error || !data) return [];
  return data.map((r: Record<string, unknown>) => ({
    id: r.id,
    date: r.date,
    peso_kg: r.peso_kg,
    imc: r.imc,
    clasificacion_imc: r.clasificacion_imc,
    grasa_corporal_pct: r.grasa_corporal_pct,
    masa_libre_grasa_kg: r.masa_libre_grasa_kg,
    agua_corporal_pct: r.agua_corporal_pct,
    grasa_visceral_nivel: r.grasa_visceral_nivel,
    masa_osea_kg: r.masa_osea_kg,
    proteinas_pct: r.proteinas_pct,
    masa_musculoesqueletica_kg: r.masa_musculoesqueletica_kg,
    tasa_metabolica_basal_kcal: r.tasa_metabolica_basal_kcal,
    frecuencia_cardiaca_ppm: r.frecuencia_cardiaca_ppm,
    peso_objetivo_kg: r.peso_objetivo_kg,
    peso_inicial_kg: r.peso_inicial_kg,
    total_perdido_kg: r.total_perdido_kg,
    source: r.source ?? "scan",
  }));
}

// ── DAILY LOGS ────────────────────────────────────────────────

export async function dbSaveDailyLog(log: DailyLog): Promise<void> {
  await supabase.from("daily_logs").upsert({
    id: log.id || `log-${log.date}`,
    user_id: USER_ID,
    date: log.date,
    trained: log.trained,
    checked_dashboard: log.checkedDashboard,
    commercial_move: log.commercialMove,
    peace: log.peace,
    sleep: log.sleep,
    migraine: log.migraine,
    migraine_hour: log.migraineHour ?? null,
    migraine_duration: log.migraineDuration ?? null,
    argued: log.argued,
    note: log.note,
  });
}

export async function dbDeleteDailyLog(id: string): Promise<void> {
  await supabase.from("daily_logs").delete().eq("id", id);
}

export async function dbLoadDailyLogs(): Promise<DailyLog[]> {
  const { data, error } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", USER_ID)
    .order("date", { ascending: false });
  if (error || !data) return [];
  return data.map((r: Record<string, unknown>) => ({
    id: r.id,
    date: r.date,
    trained: r.trained,
    checkedDashboard: r.checked_dashboard,
    commercialMove: r.commercial_move,
    peace: r.peace,
    sleep: r.sleep,
    migraine: r.migraine,
    migraineHour: r.migraine_hour,
    migraineDuration: r.migraine_duration,
    argued: r.argued,
    note: r.note ?? "",
  }));
}

// ── TRANSACTIONS ──────────────────────────────────────────────

export async function dbSaveTransaction(tx: Transaction): Promise<void> {
  await supabase.from("transactions").upsert({
    id: tx.id,
    user_id: USER_ID,
    date: tx.date,
    amount: tx.amount,
    type: tx.type,
    category: tx.category,
    intent: tx.intent,
    note: tx.note,
  });
}

export async function dbDeleteTransaction(id: string): Promise<void> {
  await supabase.from("transactions").delete().eq("id", id);
}

export async function dbLoadTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", USER_ID)
    .order("date", { ascending: false });
  if (error || !data) return [];
  return data.map((r: Record<string, unknown>) => ({
    id: r.id,
    date: r.date,
    amount: r.amount,
    type: r.type,
    category: r.category,
    intent: r.intent,
    note: r.note ?? "",
  }));
}
