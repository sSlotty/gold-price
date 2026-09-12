"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

/* Shared interaction primitives. Every variant keeps a 40px+ hit target and
   inherits the global focus-visible ring. */

const VARIANTS = {
  primary:
    "bg-accent text-on-accent hover:bg-accent-hover border border-transparent",
  secondary:
    "bg-surface text-fg border border-line hover:bg-surface-2 hover:border-line-strong",
  ghost:
    "bg-transparent text-fg-muted border border-transparent hover:bg-surface-2 hover:text-fg",
  danger:
    "bg-transparent text-fg-subtle border border-transparent hover:bg-neg-soft hover:text-neg",
} as const;

const SIZES = {
  sm: "h-9 px-3 text-[0.8125rem] gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  icon: "h-9 w-9 justify-center text-base",
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
};

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex shrink-0 items-center rounded-lg font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  );
}

export function Card({
  children,
  className = "",
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
}) {
  return (
    <Tag
      className={`rounded-card border border-line bg-surface shadow-card ${className}`}
    >
      {children}
    </Tag>
  );
}

/** Small uppercase section label. Kept at 12px — below that Thai is unreadable. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-semibold tracking-[0.12em] text-fg-subtle uppercase">
      {children}
    </span>
  );
}

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-fg">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-xs text-neg">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-xs text-fg-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-fg placeholder:text-fg-subtle transition-colors hover:border-accent-ring focus:border-accent-ring focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-[invalid=true]:border-neg";

/** Accessible segmented control: a real radiogroup with roving labels. */
export function SegmentedControl<T extends string>({
  name,
  label,
  value,
  onChange,
  options,
}: {
  name: string;
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; hint?: string }[];
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-sm font-medium text-fg">{label}</legend>
      <div className="flex flex-wrap gap-1 rounded-xl border border-line bg-surface-2 p-1">
        {options.map((option) => {
          const id = `${name}-${option.value}`;
          const active = option.value === value;
          return (
            <div key={option.value} className="min-w-0 flex-1">
              <input
                type="radio"
                id={id}
                name={name}
                value={option.value}
                checked={active}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <label
                htmlFor={id}
                className={`flex cursor-pointer flex-col rounded-lg px-3 py-2 text-center transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus ${
                  active
                    ? "bg-surface text-accent shadow-card"
                    : "text-fg-muted hover:bg-surface-3 hover:text-fg"
                }`}
              >
                <span className="truncate text-sm font-medium">{option.label}</span>
                {option.hint ? (
                  <span className="truncate text-xs text-fg-subtle">{option.hint}</span>
                ) : null}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse rounded bg-surface-3 ${className}`}
    />
  );
}
