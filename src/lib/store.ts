import { useSyncExternalStore } from "react";

export type Language = "en" | "te";

import type { Extraction } from "@/lib/medicine-analysis";

export type ScanRecord = {
  id: string;
  /** Verified catalogue id, or null when the reading matched nothing trusted. */
  medicineId: string | null;
  /** What the vision model actually read off the packaging. */
  extraction?: Extraction;
  imageDataUrl: string | null;
  confidence: number;
  scannedAt: string;
};

export type CabinetItem = {
  id: string;
  medicineId: string;
  brandName: string;
  expiry: string;
  addedAt: string;
};

export type AppState = {
  language: Language;
  user: { name: string } | null;
  cabinet: CabinetItem[];
  history: ScanRecord[];
};

const STORAGE_KEY = "medilens-state-v1";

const defaultState: AppState = {
  language: "en",
  user: null,
  cabinet: [],
  history: [],
};

let state: AppState = defaultState;
let hydrated = false;
const listeners = new Set<() => void>();

function read(): AppState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...(JSON.parse(raw) as Partial<AppState>) };
  } catch {
    return defaultState;
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function setState(updater: (prev: AppState) => AppState) {
  state = updater(state);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }
  emit();
}

function subscribe(listener: () => void) {
  if (!hydrated && typeof window !== "undefined") {
    hydrated = true;
    state = read();
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAppState(): AppState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => defaultState,
  );
}

export const actions = {
  setLanguage(language: Language) {
    setState((s) => ({ ...s, language }));
  },
  signIn(name: string) {
    setState((s) => ({ ...s, user: { name } }));
  },
  signOut() {
    setState((s) => ({ ...s, user: null }));
  },
  addScan(record: ScanRecord) {
    setState((s) => ({ ...s, history: [record, ...s.history].slice(0, 20) }));
  },
  saveToCabinet(item: CabinetItem) {
    setState((s) => ({
      ...s,
      cabinet: [item, ...s.cabinet.filter((c) => c.medicineId !== item.medicineId)],
    }));
  },
  updateExpiry(id: string, expiry: string) {
    setState((s) => ({
      ...s,
      cabinet: s.cabinet.map((c) => (c.id === id ? { ...c, expiry } : c)),
    }));
  },
  removeFromCabinet(id: string) {
    setState((s) => ({ ...s, cabinet: s.cabinet.filter((c) => c.id !== id) }));
  },
};

export function getScan(id: string): ScanRecord | undefined {
  if (typeof window === "undefined") return undefined;
  const current = hydrated ? state : read();
  return current.history.find((h) => h.id === id);
}

export type ExpiryStatus = "valid" | "expiring" | "expired";

export function expiryStatus(expiry: string): ExpiryStatus {
  const date = new Date(expiry).getTime();
  if (Number.isNaN(date)) return "valid";
  const now = Date.now();
  const days = (date - now) / 86_400_000;
  if (days < 0) return "expired";
  if (days <= 90) return "expiring";
  return "valid";
}
