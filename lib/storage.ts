import type { AppState } from "@/types";
import { INITIAL_STATE } from "@/data/initial-data";

const STORAGE_KEY = "aaron-os::v3";

export interface StorageDriver {
  load: () => Promise<AppState>;
  save: (state: AppState) => Promise<void>;
  reset: () => Promise<AppState>;
}

const isBrowser = typeof window !== "undefined";

export const localDriver: StorageDriver = {
  async load() {
    if (!isBrowser) return INITIAL_STATE;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return INITIAL_STATE;
      const parsed = JSON.parse(raw) as AppState;
      if (!parsed.schemaVersion || parsed.schemaVersion < 3) return INITIAL_STATE;
      return { ...INITIAL_STATE, ...parsed };
    } catch {
      return INITIAL_STATE;
    }
  },
  async save(state) {
    if (!isBrowser) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },
  async reset() {
    if (isBrowser) localStorage.removeItem(STORAGE_KEY);
    return INITIAL_STATE;
  },
};

export const storage: StorageDriver = localDriver;
