"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * A tiny localStorage-backed external store.
 *
 * Reading persisted state through `useSyncExternalStore` (rather than a
 * setState-in-effect on mount) keeps server and client snapshots explicit, so
 * there is no hydration mismatch and no cascading render — and cross-tab
 * `storage` events come along for free.
 */

const listeners = new Map<string, Set<() => void>>();
const cache = new Map<string, string | null>();

export function readLocal(key: string): string | null {
  if (!cache.has(key)) {
    try {
      cache.set(key, localStorage.getItem(key));
    } catch {
      cache.set(key, null); // private mode or blocked storage
    }
  }
  return cache.get(key) ?? null;
}

export function writeLocal(key: string, value: string) {
  cache.set(key, value);
  try {
    localStorage.setItem(key, value);
  } catch {
    /* quota or private mode — the in-memory cache still serves this session */
  }
  listeners.get(key)?.forEach((listener) => listener());
}

/** Current value of `key`, or `serverValue` during SSR and hydration. */
export function useLocalValue(key: string, serverValue: string | null = null) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      let set = listeners.get(key);
      if (!set) listeners.set(key, (set = new Set()));
      set.add(onChange);

      const onStorage = (event: StorageEvent) => {
        if (event.key !== key) return;
        cache.delete(key);
        onChange();
      };
      window.addEventListener("storage", onStorage);

      return () => {
        set.delete(onChange);
        window.removeEventListener("storage", onStorage);
      };
    },
    [key],
  );

  return useSyncExternalStore(
    subscribe,
    () => readLocal(key),
    () => serverValue,
  );
}
