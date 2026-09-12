"use client";

import { useCallback, useEffect } from "react";
import { useLocalValue, writeLocal } from "@/lib/local-store";

export type ThemePreference = "light" | "dark" | "system";

export const THEME_KEY = "aurum.theme";

/** Inlined in <head> so the theme is applied before first paint (no flash). */
export const themeBootstrapScript = `(()=>{try{var p=localStorage.getItem(${JSON.stringify(
  THEME_KEY,
)})||"system";var d=p==="dark"||(p==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light"}catch(e){document.documentElement.dataset.theme="light"}})()`;

const isPreference = (value: string | null): value is ThemePreference =>
  value === "light" || value === "dark" || value === "system";

export function useTheme() {
  // `null` server snapshot → "system" during SSR/hydration, then the real value.
  const stored = useLocalValue(THEME_KEY);
  const preference: ThemePreference = isPreference(stored) ? stored : "system";

  // Pure external-system sync: pushes the choice onto <html>, never setState.
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme =
        preference === "system" ? (media.matches ? "dark" : "light") : preference;
    };
    apply();
    if (preference !== "system") return;
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [preference]);

  return {
    preference,
    setPreference: useCallback(
      (next: ThemePreference) => writeLocal(THEME_KEY, next),
      [],
    ),
  };
}
