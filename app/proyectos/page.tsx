"use client";

import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAppState } from "@/lib/state";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { uid } from "@/lib/utils";
import type { Project, ProjectStatus } from "@/types";

const STATUSES: { value: ProjectStatus; label: string; color: string }[] = [
  { value: "idea",    label: "Idea",       color: "#64748b" },
  { value: "active",  label: "Activo",     color: "#22e6ff" },
  { value: "blocked", label: "Bloqueado",  color: "#f43f5e" },
  { value: "paused",  label: "Pausado",    color: "#fbbf24" },
  { value: "done",    label: "Completado", color: "#22d3a5" },
];

function ProjectCard({ project }: { project: Project }) {
  const { dispatch } = useAppState();
  const [p, setP] = useState<Project>(project);
  const dirty = JSON.stringify(p) !== JSON.stringify(project);
  const statusMeta = STATUSES.find((s) => s.value === p.status)!;

  function save() {
    dispatch({ type: "UPSERT_PROJECT", payload: { ...p, updatedAt: new Date().toISOString() } });
  }

  return (
    <Card>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <input
            value={p.name}
            onChange={(e) => setP({ ...p, name: e.target.value })}
            className="flex-1 bg-transparent border-none p-0 text-base font-medium text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-0"
            placeholder="Nombre del proyecto"
          />
          <span className="ml-3 text-[10px] uppercase tracking-widest" style={{ color: statusMeta.color }}>
            {statusMeta.label}
          </span>
        </div>

        <ProgressBar
          value={p.progress}
          tone={p.progress >= 80 ? "green" : p.progress >= 40 ? "cyan" : "amber"}
        />

        <div className="grid gap-2 md:grid-cols-2">
          <div>
            <div className="mb-1 text-[10px] uppercase tracking-widest text-slate-700">Estado</div>
            <select
              value={p.status}
              onChange={(e) => setP({ ...p, status: e.target.value as ProjectStatus })}
            >
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <div className="mb-1 text-[10px] uppercase tracking-widest text-slate-700">Progreso · {p.progress}%</div>
            <input
              type="range" min={0} max={100}
              value={p.progress}
              onChange={(e) => setP({ ...p, progress: Number(e.target.value) })}
              className="accent-cyan-glow"
              style={{ padding: 0, background: "transparent" }}
            />
          </div>
        </div>

        <input
          value={p.nextAction}
          onChange={(e) => setP({ ...p, nextAction: e.target.value })}
          placeholder="Próxima acción concreta"
        />

        <div className="flex items-center justify-between pt-1">
          <Button variant="danger" size="sm" onClick={() => dispatch({ type: "REMOVE_PROJECT", payload: { id: p.id } })}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="primary" size="sm" onClick={save} disabled={!dirty}>
            <Save className="h-3.5 w-3.5" /> Guardar
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function ProyectosPage() {
  const { state, dispatch } = useAppState();

  function addBlank() {
    dispatch({
      type: "UPSERT_PROJECT",
      payload: {
        id: uid(),
        name: "Nuevo proyecto",
        objective: "",
        status: "idea",
        progress: 0,
        nextAction: "",
        blocker: "",
        updatedAt: new Date().toISOString(),
      },
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.4em] text-slate-600">Contexto · Ejecución</div>
          <h1 className="mt-1 text-2xl font-semibold text-slate-100">Proyectos</h1>
        </div>
        <Button variant="primary" size="sm" onClick={addBlank}>
          <Plus className="h-3.5 w-3.5" /> Nuevo
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {state.projects.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <ProjectCard project={p} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
