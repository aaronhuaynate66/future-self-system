"use client";

import { dbSaveDailyLog, dbDeleteDailyLog, dbLoadDailyLogs } from "@/lib/db";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import type {
  AppState,
  DailyLog,
  FinanceState,
  HealthState,
  Project,
  TopTask,
} from "@/types";
import { INITIAL_STATE } from "@/data/initial-data";
import { storage } from "@/lib/storage";
import { todayIso } from "@/lib/dates";
import { uid as randomId } from "@/lib/utils";

type Action =
  | { type: "HYDRATE"; payload: AppState }
  | { type: "RESET" }
  | { type: "UPSERT_DAILY_LOG"; payload: Omit<DailyLog, "id"> & { id?: string } }
  | { type: "REMOVE_DAILY_LOG"; payload: { id: string } }
  | { type: "SET_TOP3_DATE"; payload: { date: string } }
  | { type: "ADD_TOP_TASK"; payload: { text: string } }
  | { type: "TOGGLE_TOP_TASK"; payload: { id: string } }
  | { type: "REMOVE_TOP_TASK"; payload: { id: string } }
  | { type: "SET_FINANCE"; payload: Partial<FinanceState> }
  | { type: "SET_HEALTH"; payload: Partial<HealthState> }
  | { type: "UPSERT_PROJECT"; payload: Project }
  | { type: "REMOVE_PROJECT"; payload: { id: string } };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE":
      return action.payload;
    case "RESET":
      return INITIAL_STATE;

    case "UPSERT_DAILY_LOG": {
      const incoming = action.payload;
      const id = incoming.id ?? randomId();
      const existing = state.dailyLogs.find((l) => l.date === incoming.date);
      const finalLog: DailyLog = { ...incoming, id: existing?.id ?? id };
      const others = state.dailyLogs.filter((l) => l.date !== incoming.date);
      return {
        ...state,
        dailyLogs: [finalLog, ...others].sort((a, b) => (a.date < b.date ? 1 : -1)),
      };
    }
    case "REMOVE_DAILY_LOG":
      return {
        ...state,
        dailyLogs: state.dailyLogs.filter((l) => l.id !== action.payload.id),
      };

    case "SET_TOP3_DATE":
      return { ...state, top3: { date: action.payload.date, tasks: [] } };
    case "ADD_TOP_TASK": {
      if (state.top3.tasks.length >= 3) return state;
      const t: TopTask = { id: randomId(), text: action.payload.text, done: false };
      return { ...state, top3: { ...state.top3, tasks: [...state.top3.tasks, t] } };
    }
    case "TOGGLE_TOP_TASK":
      return {
        ...state,
        top3: {
          ...state.top3,
          tasks: state.top3.tasks.map((t) =>
            t.id === action.payload.id ? { ...t, done: !t.done } : t
          ),
        },
      };
    case "REMOVE_TOP_TASK":
      return {
        ...state,
        top3: {
          ...state.top3,
          tasks: state.top3.tasks.filter((t) => t.id !== action.payload.id),
        },
      };

    case "SET_FINANCE":
      return { ...state, finance: { ...state.finance, ...action.payload } };
    case "SET_HEALTH":
      return { ...state, health: { ...state.health, ...action.payload } };
    case "UPSERT_PROJECT": {
      const exists = state.projects.some((p) => p.id === action.payload.id);
      const next = exists
        ? state.projects.map((p) =>
            p.id === action.payload.id ? action.payload : p
          )
        : [...state.projects, action.payload];
      return { ...state, projects: next };
    }
    case "REMOVE_PROJECT":
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.payload.id),
      };

    default:
      return state;
  }
}

interface Ctx {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  hydrated: boolean;
}

const AppStateContext = createContext<Ctx | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const hydratedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Cargar desde localStorage primero (rápido)
      const data = await storage.load();
      const today = todayIso();
      const top3 = data.top3.date === today ? data.top3 : { date: today, tasks: [] };
      if (!cancelled) {
        dispatch({ type: "HYDRATE", payload: { ...data, top3 } });
        hydratedRef.current = true;
      }
      // Luego sincronizar desde Supabase (permanente)
      dbLoadDailyLogs().then(remoteLogs => {
        if (cancelled || remoteLogs.length === 0) return;
        dispatch({ type: "HYDRATE", payload: { ...data, top3, dailyLogs: remoteLogs } });
      }).catch(() => {});
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    storage.save(state);
  }, [state]);

  const value = useMemo<Ctx>(
    () => ({ state, dispatch, hydrated: hydratedRef.current }),
    [state]
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
