"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchCalendarEvents,
  eventsForDate,
  currentEvent,
  nextEvent,
  type CalEvent,
} from "@/lib/calendar";

export interface CalendarState {
  events: CalEvent[];
  todayEvents: CalEvent[];
  current: CalEvent | null;
  next: CalEvent | null;
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

export function useCalendar(autoRefreshMs = 2 * 60 * 1000) {
  const [state, setState] = useState<CalendarState>({
    events: [],
    todayEvents: [],
    current: null,
    next: null,
    loading: true,
    error: null,
    lastFetched: null,
  });

  const load = useCallback(async (force = false) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const events = await fetchCalendarEvents(force);
      const now = new Date();
      setState({
        events,
        todayEvents: eventsForDate(events, now),
        current: currentEvent(events, now),
        next: nextEvent(events, now),
        loading: false,
        error: null,
        lastFetched: now,
      });
    } catch (err) {
      setState(s => ({ ...s, loading: false, error: String(err) }));
    }
  }, []);

  // Carga inicial
  useEffect(() => { load(); }, [load]);

  // Auto-refresh cada X ms
  useEffect(() => {
    const id = setInterval(() => load(), autoRefreshMs);
    return () => clearInterval(id);
  }, [load, autoRefreshMs]);

  // Actualizar current/next cada minuto
  useEffect(() => {
    const id = setInterval(() => {
      setState(s => {
        if (s.events.length === 0) return s;
        const now = new Date();
        return {
          ...s,
          todayEvents: eventsForDate(s.events, now),
          current: currentEvent(s.events, now),
          next: nextEvent(s.events, now),
        };
      });
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  return { ...state, refresh: () => load(true) };
}
