"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Quote } from "lucide-react";
import { FUTURE_SELF_RULES, MISSION, MISSION_SUB } from "@/data/rules";
import { Card } from "@/components/ui/Card";

export default function ReglasPage() {
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <div className="text-[11px] uppercase tracking-[0.4em] text-slate-600">Identidad operativa</div>
        <h1 className="mt-1 text-2xl font-semibold text-slate-100">Reglas del Yo Futuro</h1>
        <p className="mt-1 text-sm text-slate-600">Las reglas son el modo de operación por defecto.</p>
      </div>

      {/* Misión */}
      <Card variant="strong">
        <div className="flex items-start gap-3">
          <Quote className="h-5 w-5 shrink-0 text-cyan-glow mt-0.5" />
          <div>
            <div className="text-xl font-semibold text-glow">{MISSION}</div>
            <div className="mt-1 text-sm text-slate-500">{MISSION_SUB}</div>
          </div>
        </div>
      </Card>

      {/* Reglas */}
      <div className="space-y-2">
        {FUTURE_SELF_RULES.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-white/[0.015] px-4 py-3.5"
          >
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-glow/60" />
            <div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-slate-700">
                Regla {i + 1}
              </div>
              <div className="mt-0.5 text-sm text-slate-200">{r.text}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
