"use client";

import { useTheme, type ThemePreference } from "@/hooks/use-theme";
import { IconMonitor, IconMoon, IconSun } from "./icons";

const OPTIONS: { value: ThemePreference; label: string; Icon: typeof IconSun }[] = [
  { value: "light", label: "สว่าง", Icon: IconSun },
  { value: "dark", label: "มืด", Icon: IconMoon },
  { value: "system", label: "ตามระบบ", Icon: IconMonitor },
];

export function ThemeToggle() {
  const { preference, setPreference } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="ธีมการแสดงผล"
      className="flex items-center gap-0.5 rounded-lg border border-line bg-surface-2 p-0.5"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setPreference(value)}
            className={`grid h-8 w-8 place-items-center rounded-md text-base transition-colors ${
              active
                ? "bg-surface text-accent shadow-card"
                : "text-fg-subtle hover:bg-surface-3 hover:text-fg"
            }`}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
}
