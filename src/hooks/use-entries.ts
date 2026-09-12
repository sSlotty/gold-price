"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalValue, readLocal, writeLocal } from "@/lib/local-store";
import {
  LEGACY_STORAGE_KEY,
  STORAGE_KEY,
  migrateEntries,
  newEntry,
  type Entry,
} from "@/lib/gold";

const SEED: Entry[] = [
  newEntry("2026-01-21", "91558.15"),
  newEntry("2026-01-21", "7063.52"),
  newEntry("2026-01-26", "74814.51"),
];

const parse = (raw: string | null): Entry[] => {
  if (raw === null) return SEED;
  try {
    return migrateEntries(JSON.parse(raw)) ?? [];
  } catch {
    return SEED;
  }
};

/**
 * Entries persisted to localStorage, with one level of undo so deleting a row
 * or clearing the list is never a dead end.
 */
export function useEntries() {
  const current = useLocalValue(STORAGE_KEY);
  const legacy = useLocalValue(LEGACY_STORAGE_KEY);
  const raw = current ?? legacy;
  const entries = useMemo(() => parse(raw), [raw]);

  const [undoState, setUndoState] = useState<{ raw: string | null; label: string } | null>(
    null,
  );

  const commit = useCallback((next: Entry[], undoLabel?: string) => {
    if (undoLabel) {
      setUndoState({
        raw: readLocal(STORAGE_KEY) ?? readLocal(LEGACY_STORAGE_KEY),
        label: undoLabel,
      });
    }
    writeLocal(STORAGE_KEY, JSON.stringify(next));
  }, []);

  // Auto-dismiss runs from a timer callback, so it never cascades a render.
  useEffect(() => {
    if (!undoState) return;
    const timer = setTimeout(() => setUndoState(null), 8000);
    return () => clearTimeout(timer);
  }, [undoState]);

  const update = useCallback(
    (id: string, field: "date" | "amount", value: string) =>
      commit(
        entries.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
      ),
    [commit, entries],
  );

  const add = useCallback(
    () => commit([...entries, newEntry()]),
    [commit, entries],
  );

  const remove = useCallback(
    (id: string) =>
      commit(
        entries.filter((item) => item.id !== id),
        "ลบรายการแล้ว",
      ),
    [commit, entries],
  );

  const clear = useCallback(
    () => commit([], `ล้าง ${entries.length} รายการแล้ว`),
    [commit, entries],
  );

  const replace = useCallback(
    (next: Entry[]) => commit(next, "นำเข้ารายการแล้ว"),
    [commit],
  );

  // The write happens in the handler, never inside a state updater — updater
  // functions run during render and must stay free of side effects.
  const undo = useCallback(() => {
    if (!undoState) return;
    writeLocal(STORAGE_KEY, undoState.raw ?? JSON.stringify(SEED));
    setUndoState(null);
  }, [undoState]);

  return {
    entries,
    update,
    add,
    remove,
    clear,
    replace,
    undo,
    undoLabel: undoState?.label ?? null,
    dismissUndo: useCallback(() => setUndoState(null), []),
  };
}
