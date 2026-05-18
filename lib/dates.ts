export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatLongDate(d: Date = new Date()): string {
  return d.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatTime(d: Date = new Date()): string {
  return d.toLocaleTimeString("es-PE", { hour12: false, hour: "2-digit", minute: "2-digit" });
}

export function dayProgressBetween(startIso: string, endIso: string, now: Date = new Date()): number {
  const start = new Date(startIso + "T00:00:00").getTime();
  const end = new Date(endIso + "T23:59:59").getTime();
  const n = now.getTime();
  if (n <= start) return 0;
  if (n >= end) return 100;
  return Math.round(((n - start) / (end - start)) * 100);
}

export function countdownDays(targetIso: string): number {
  const target = new Date(targetIso + "T00:00:00").getTime();
  const now = new Date().getTime();
  const diff = target - now;
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
