"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sun, CalendarRange, ClipboardCheck, Gauge,
  Wallet, Flame, Target, Shield, Cpu, HeartPulse,
} from "lucide-react";
import { cn } from "@/lib/utils";

const OS_LINKS = [
  { href: "/hoy",      label: "Hoy",           icon: Sun },
  { href: "/horario",  label: "Horario",       icon: CalendarRange },
  { href: "/registro", label: "Registro",      icon: ClipboardCheck },
  { href: "/score",    label: "Score",         icon: Gauge },
];

const CONTEXT_LINKS = [
  { href: "/finanzas",  label: "Finanzas",  icon: Wallet },
  { href: "/cuerpo",    label: "Cuerpo",    icon: HeartPulse },
  { href: "/mundial",   label: "Mundial",   icon: Flame },
  { href: "/proyectos", label: "Proyectos", icon: Target },
  { href: "/reglas",    label: "Reglas",    icon: Shield },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/[0.05] bg-ink-950/80 px-3 py-6 backdrop-blur-xl md:flex">
      {/* Logo */}
      <div className="mb-8 px-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-glow/25 bg-cyan-glow/[0.07]">
            <Cpu className="h-3.5 w-3.5 text-cyan-glow" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-soft/80">
              Aaron OS
            </div>
            <div className="text-[9px] uppercase tracking-widest text-slate-600">
              v2 · Mission Control
            </div>
          </div>
        </div>
      </div>

      {/* OS Core */}
      <nav className="flex flex-col gap-0.5">
        <div className="mb-1.5 px-3 text-[9px] uppercase tracking-[0.4em] text-slate-600">
          OS
        </div>
        {OS_LINKS.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== "/" && path?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-150",
                active
                  ? "bg-cyan-glow/[0.07] text-cyan-soft"
                  : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-cyan-glow" />
              )}
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-cyan-glow" : "text-slate-600")} />
              <span className="tracking-wide">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Contexto */}
      <nav className="mt-6 flex flex-col gap-0.5">
        <div className="mb-1.5 px-3 text-[9px] uppercase tracking-[0.4em] text-slate-600">
          Contexto
        </div>
        {CONTEXT_LINKS.map(({ href, label, icon: Icon }) => {
          const active = path?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-150",
                active
                  ? "bg-white/[0.05] text-slate-200"
                  : "text-slate-600 hover:bg-white/[0.03] hover:text-slate-400"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="tracking-wide">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mission */}
      <div className="mt-auto rounded-xl border border-cyan-glow/[0.12] bg-cyan-glow/[0.03] px-3 py-3">
        <div className="text-[9px] uppercase tracking-[0.35em] text-slate-600">Misión</div>
        <div className="mt-1 font-mono text-sm text-glow">Conseguir paz.</div>
      </div>
    </aside>
  );
}
