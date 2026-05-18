import type { DayKey, ScheduleBlock } from "@/types";
import { WEEK_SCHEDULE } from "@/data/schedule";

export function dayKeyOf(date: Date = new Date()): DayKey {
  const map: DayKey[] = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];
  return map[date.getDay()];
}

export function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function nowMinutes(date: Date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function currentAndNext(date: Date = new Date()): {
  current: ScheduleBlock | null;
  next: ScheduleBlock | null;
  progress: number; // 0-100 del bloque actual
} {
  const key = dayKeyOf(date);
  const blocks = WEEK_SCHEDULE[key];
  const now = nowMinutes(date);

  let current: ScheduleBlock | null = null;
  let next: ScheduleBlock | null = null;
  let progress = 0;

  for (const b of blocks) {
    const start = minutesOf(b.start);
    const end = minutesOf(b.end);
    if (now >= start && now < end) {
      current = b;
      const span = Math.max(1, end - start);
      progress = Math.round(((now - start) / span) * 100);
    } else if (now < start && next === null) {
      next = b;
    }
  }

  return { current, next, progress };
}

export function timeUntilNext(next: ScheduleBlock | null, date: Date = new Date()): string {
  if (!next) return "";
  const nowMins = nowMinutes(date);
  const nextMins = minutesOf(next.start);
  const diff = nextMins - nowMins;
  if (diff <= 0) return "";
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
