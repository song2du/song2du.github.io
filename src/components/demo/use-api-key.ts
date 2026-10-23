"use client";

import { useSyncExternalStore } from "react";

// The visitor's API key lives in sessionStorage: shared by every demo in the tab,
// gone when the tab closes. Falls back to memory when storage is blocked.
const STORAGE_KEY = "demo:anthropic-api-key";
const listeners = new Set<() => void>();
let memory: string | null = null;

function read() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? memory;
  } catch {
    return memory;
  }
}

function write(value: string | null) {
  memory = value;
  try {
    if (value) sessionStorage.setItem(STORAGE_KEY, value);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked (private mode, disabled site data): memory is enough.
  }
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => listeners.delete(notify);
}

export function useApiKey() {
  const key = useSyncExternalStore(subscribe, read, () => null);
  return [key, write] as const;
}
