"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp, ExternalLink, Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────

type ProjectStatus = "activo" | "pausado" | "completado";

interface Task {
  id: string;
  text: string;
  done: boolean;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  color: string;
  url?: string;
  tasks: Task[];
  nextAction: string;
  kpis: { label: string; value: string }[];
  updatedAt: string;
}

const STORAGE_KEY = "aaron_proyectos";

const STATUS_META: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  activo:     { label: "Activo",     color: "#22d3a5", bg: "rgba(34,211,165,0.10)" },
  pausado:    { label: "Pausado",    color: "#fbbf24", bg: "rgba(251,191,36,0.10)"  },
  completado: { label: "Completado", color: "#64748b", bg: "rgba(100,116,139,0.10)" },
};

// ─────────────────────────────────────────────────────────────
// PROYECTOS INICIALES
// ─────────────────────────────────────────────────────────────

const INITIAL_PROJECTS: Project[] = [
  {
    id: "sir",
    name: "SIR",
    description: "Sistema de Inteligencia Relacional — plataforma para gestionar relaciones estratégicas con IA. Monorepo TypeScript con web, admin y mobile.",
    status: "activo",
    color: "#22e6ff",
    url: "https://sir-web.vercel.app",
    nextAction: "Completar módulos Fase 7 pendientes (39, 40, 41, 42, 44) + lanzamiento Product Hunt",
    kpis: [
      { label: "Módulos completos", value: "46/59" },
      { label: "Progreso",          value: "78%"   },
      { label: "Fase actual",       value: "7 — Distribución" },
      { label: "Pendientes",        value: "13 módulos" },
    ],
    tasks: [
      { id: "t1", text: "Módulo 39 — Re-sincronización Google Contacts", done: false },
      { id: "t2", text: "Módulo 40 — WhatsApp Bot (número propio)",      done: false },
      { id: "t3", text: "Módulo 42 — Stripe + pagos activados",          done: false },
      { id: "t4", text: "Módulo 44 — EAS Build App Store/Play Store",    done: false },
      { id: "t5", text: "Fix B2 — Google Contacts bajó de 602 a 131",   done: false },
      { id: "t6", text: "M02 — Video demo del producto",                 done: false },
      { id: "t7", text: "M03 — Post LinkedIn caso de uso Diana",         done: false },
      { id: "t8", text: "M06 — Product Hunt launch",                     done: false },
    ],
    updatedAt: "2026-05-18",
  },
  {
    id: "aaron-os",
    name: "Aaron OS",
    description: "Sistema operativo personal — Mission Control conectado a vida real. Calendario Outlook, Body OS, Financial OS, Score operacional.",
    status: "activo",
    color: "#22d3a5",
    url: "https://aaron.marlabinc.com",
    nextAction: "Completar Financial OS con datos reales + /proyectos + mejorar /hoy con widgets",
    kpis: [
      { label: "Módulos listos",  value: "11"  },
      { label: "En progreso",     value: "6"   },
      { label: "Pendientes",      value: "7"   },
      { label: "Deploy",          value: "Live ✓" },
    ],
    tasks: [
      { id: "a1", text: "Financial OS — entrar datos reales de ingresos/gastos", done: false },
      { id: "a2", text: "Supabase persistencia — verificar que guarda correctamente", done: false },
      { id: "a3", text: "Body OS — subir mediciones históricas", done: false },
      { id: "a4", text: "/hoy — agregar widget Financial y Body en overview", done: false },
      { id: "a5", text: "PWA — instalar como app en móvil", done: false },
      { id: "a6", text: "Notificaciones — Recovery Mode + recordatorios", done: false },
    ],
    updatedAt: "2026-05-20",
  },
  {
    id: "marlab",
    name: "Comercial MarLab",
    description: "Hacer crecer MarLab hasta S/ 1M anual. Servicios: consultoría growth, automatizaciones IA, marketing digital, landing pages, campañas Meta/Google Ads.",
    status: "activo",
    color: "#f59e0b",
    nextAction: "Conseguir 1 cliente recurrente que pague mínimo S/ 5,000/mes + outreach diario constante",
    kpis: [
      { label: "Meta mensual",       value: "S/ 83,333" },
      { label: "Cliente recurrente", value: "S/ 5,000"  },
      { label: "Ingresos actuales",  value: "—"          },
      { label: "Prospectos activos", value: "—"          },
    ],
    tasks: [
      { id: "m1", text: "Definir servicios con precio fijo y propuesta clara",      done: false },
      { id: "m2", text: "Listar 10 prospectos ideales para outreach esta semana",   done: false },
      { id: "m3", text: "Hacer mínimo 1 movimiento comercial diario",               done: false },
      { id: "m4", text: "Cerrar primer cliente recurrente S/ 5,000/mes",            done: false },
      { id: "m5", text: "Configurar seguimiento semanal de pipeline en /proyectos", done: false },
      { id: "m6", text: "Conectar ingresos MarLab con Financial OS",                done: false },
    ],
    updatedAt: "2026-05-20",
  },
];

// ─────────────────────────────────────────────────────────────
// STORAGE
// ─────────────────────────────────────────────────────────────

function loadProjects(): Project[] {
  if (typeof window === "undefined") return INITIAL_PROJECTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_PROJECTS;
    return JSON.parse(raw);
  } catch { return INITIAL_PROJECTS; }
}

function saveProjects(projects: Project[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

// ─────────────────────────────────────────────────────────────
// PROJECT CARD
// ─────────────────────────────────────────────────────────────

function ProjectCard({
  project, onUpdate,
}: {
  project: Project;
  onUpdate: (p: Project) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [newTask, setNewTask]   = useState("");
  const [editKpi, setEditKpi]   = useState<{ idx: number; field: "label" | "value"; val: string } | null>(null);

  const doneTasks  = project.tasks.filter(t => t.done).length;
  const totalTasks = project.tasks.length;
  const pct        = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const meta       = STATUS_META[project.status];

  function toggleTask(id: string) {
    const tasks = project.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    onUpdate({ ...project, tasks, updatedAt: new Date().toISOString().slice(0, 10) });
  }

  function addTask() {
    if (!newTask.trim()) return;
    const task: Task = { id: `t-${Date.now()}`, text: newTask.trim(), done: false };
    onUpdate({ ...project, tasks: [...project.tasks, task] });
    setNewTask("");
  }

  function removeTask(id: string) {
    onUpdate({ ...project, tasks: project.tasks.filter(t => t.id !== id) });
  }

  function updateNextAction(val: string) {
    onUpdate({ ...project, nextAction: val });
  }

  function updateKpi(idx: number, field: "label" | "value", val: string) {
    const kpis = project.kpis.map((k, i) => i === idx ? { ...k, [field]: val } : k);
    onUpdate({ ...project, kpis });
  }

  function cycleStatus() {
    const order: ProjectStatus[] = ["activo", "pausado", "completado"];
    const next = order[(order.indexOf(project.status) + 1) % order.length];
    onUpdate({ ...project, status: next });
  }

  return (
    <div
      className="overflow-hidden rounded-2xl border transition-all"
      style={{ borderColor: `${project.color}30`, background: `${project.color}05` }}
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 h-3 w-3 shrink-0 rounded-full" style={{ background: project.color, boxShadow: `0 0 8px ${project.color}` }} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black text-white">{project.name}</h2>
                {project.url && (
                  <a href={project.url} target="_blank" rel="noopener noreferrer"
                    className="text-slate-600 hover:text-slate-300 transition-colors">
                    <ExternalLink size={12} />
                  </a>
                )}
                <button onClick={cycleStatus}
                  className="rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest transition-all"
                  style={{ borderColor: `${meta.color}40`, background: meta.bg, color: meta.color }}>
                  {meta.label}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">{project.description}</p>
            </div>
          </div>
          <button onClick={() => setExpanded(e => !e)} className="shrink-0 text-slate-600 hover:text-slate-300 transition-colors mt-0.5">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* KPIs */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {project.kpis.map((kpi, i) => (
            <div key={i} className="rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 py-2">
              <div className="text-[9px] uppercase tracking-widest text-slate-600">{kpi.label}</div>
              {editKpi?.idx === i && editKpi.field === "value" ? (
                <input autoFocus value={editKpi.val}
                  onChange={e => setEditKpi({ ...editKpi, val: e.target.value })}
                  onBlur={() => { updateKpi(i, "value", editKpi.val); setEditKpi(null); }}
                  onKeyDown={e => e.key === "Enter" && (updateKpi(i, "value", editKpi.val), setEditKpi(null))}
                  className="mt-0.5 w-full bg-transparent font-mono text-sm font-bold text-white focus:outline-none"
                />
              ) : (
                <div className="mt-0.5 font-mono text-sm font-bold cursor-pointer"
                  style={{ color: project.color }}
                  onClick={() => setEditKpi({ idx: i, field: "value", val: kpi.value })}>
                  {kpi.value || "—"}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progreso de tareas */}
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-[10px] text-slate-600">
            <span>Tareas {doneTasks}/{totalTasks}</span>
            <span style={{ color: project.color }}>{pct}%</span>
          </div>
          <ProgressBar value={pct} color={project.color} height="thin" />
        </div>

        {/* Next action */}
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2">
          <Zap size={12} className="mt-0.5 shrink-0" style={{ color: project.color }} />
          <textarea
            value={project.nextAction}
            onChange={e => updateNextAction(e.target.value)}
            rows={1}
            placeholder="Próxima acción..."
            className="flex-1 resize-none bg-transparent text-xs text-slate-300 placeholder-slate-700 focus:outline-none"
            style={{ lineHeight: "1.4" }}
          />
        </div>
      </div>

      {/* Tasks expandibles */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/[0.04] px-5 pb-5 pt-4"
          >
            <div className="mb-3 text-[10px] uppercase tracking-widest text-slate-600">Tareas pendientes</div>
            <div className="space-y-1.5">
              {project.tasks.map(task => (
                <div key={task.id} className="flex items-center gap-2 group">
                  <button onClick={() => toggleTask(task.id)} className="shrink-0">
                    {task.done
                      ? <CheckCircle2 size={15} className="text-emerald-400" />
                      : <Circle size={15} className="text-slate-700" />
                    }
                  </button>
                  <span className={`flex-1 text-xs ${task.done ? "text-slate-600 line-through" : "text-slate-300"}`}>
                    {task.text}
                  </span>
                  <button onClick={() => removeTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-red-400 transition-all">
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add task */}
            <div className="mt-3 flex gap-2">
              <input
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addTask()}
                placeholder="Nueva tarea..."
                className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs text-white placeholder-slate-700 focus:border-cyan-400/30 focus:outline-none"
              />
              <button onClick={addTask}
                className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-slate-400 hover:text-white transition-colors">
                <Plus size={14} />
              </button>
            </div>

            <div className="mt-2 text-[9px] text-slate-700">Última actualización: {project.updatedAt}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function ProyectosPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => { setProjects(loadProjects()); setMounted(true); }, []);

  function handleUpdate(updated: Project) {
    const list = projects.map(p => p.id === updated.id ? updated : p);
    setProjects(list);
    saveProjects(list);
  }

  if (!mounted) return null;

  const activos     = projects.filter(p => p.status === "activo");
  const pausados    = projects.filter(p => p.status === "pausado");
  const completados = projects.filter(p => p.status === "completado");

  const totalTareas  = projects.flatMap(p => p.tasks).length;
  const tareasDone   = projects.flatMap(p => p.tasks).filter(t => t.done).length;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Proyectos</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {activos.length} activos · {tareasDone}/{totalTareas} tareas completadas
          </p>
        </div>
      </div>

      {/* Overview strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Activos",     count: activos.length,     color: "#22d3a5" },
          { label: "Pausados",    count: pausados.length,    color: "#fbbf24" },
          { label: "Completados", count: completados.length, color: "#64748b" },
        ].map(({ label, count, color }) => (
          <div key={label} className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 text-center">
            <div className="text-2xl font-black tabular-nums" style={{ color }}>{count}</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-widest text-slate-600">{label}</div>
          </div>
        ))}
      </div>

      {/* Proyectos activos */}
      <div className="space-y-4">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} onUpdate={handleUpdate} />
        ))}
      </div>

    </div>
  );
}
