import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPEN(n: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

export function formatUSD(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

export function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function pad(n: number) {
  return n.toString().padStart(2, "0");
}
