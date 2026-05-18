"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, CalendarRange, ClipboardCheck, Gauge, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/hoy",      label: "Hoy",     icon: Sun },
  { href: "/horario",  label: "Horario", icon: CalendarRange },
  { href: "/registro", label: "Log",     icon: ClipboardCheck },
  { href: "/score",    label: "Score",   icon: Gauge },
  { href: "/reglas",   label: "Reglas",  icon: Shield },
];

export function MobileNav() {
  const path = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06] bg-ink-950/90 px-2 pb-safe pt-2 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around gap-1">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== "/" && path?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 transition-all",
                active ? "text-cyan-soft" : "text-slate-600"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_6px_rgba(34,230,255,0.6)]")} />
              <span className="text-[9px] uppercase tracking-widest">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
