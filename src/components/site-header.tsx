"use client";

import { METALS, PRICE_MODES, formatUpdatedAt, money, type PriceMode } from "@/lib/gold";
import type { PriceStatus } from "@/hooks/use-gold-prices";
import { IconAlert, IconRefresh } from "./icons";
import { Button, Skeleton } from "./ui";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader({
  price,
  status,
  updatedAt,
  mode,
  onRefresh,
}: {
  price: number | null;
  status: PriceStatus;
  updatedAt: string | null;
  mode: PriceMode;
  onRefresh: () => void;
}) {
  return (
    <header className="screen-only app-surface z-30 border-b border-line sm:sticky sm:top-0">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
        <a
          href="#main"
          className="sr-only focus-visible:not-sr-only focus-visible:rounded-lg focus-visible:bg-surface focus-visible:px-3 focus-visible:py-2 focus-visible:text-sm"
        >
          ข้ามไปยังเนื้อหาหลัก
        </a>

        <Logo />

        {/* Live ticker: the one number worth having on screen at all times. */}
        <div className="order-last flex w-full min-w-0 items-center gap-3 border-t border-line pt-3 sm:order-none sm:w-auto sm:flex-1 sm:border-0 sm:pt-0">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-fg-subtle">
              {METALS.bar.label} · {PRICE_MODES[mode].label}
            </p>
            <p aria-live="polite" className="truncate text-base font-semibold">
              {status === "loading" ? (
                <Skeleton className="h-5 w-28" />
              ) : status === "error" ? (
                <span className="inline-flex items-center gap-1.5 text-neg">
                  <IconAlert />
                  ดึงราคาไม่สำเร็จ
                </span>
              ) : price ? (
                <>
                  {money(price)}
                  <span className="ms-2 text-xs font-normal text-fg-subtle">
                    / บาททอง · {formatUpdatedAt(updatedAt)}
                  </span>
                </>
              ) : (
                <span className="text-fg-muted">ไม่มีข้อมูลราคา</span>
              )}
            </p>
          </div>
          <Button
            size="sm"
            onClick={onRefresh}
            disabled={status === "refreshing" || status === "loading"}
            aria-label="รีเฟรชราคาทองคำ"
          >
            <IconRefresh className={status === "refreshing" ? "animate-spin" : ""} />
            <span className="hidden sm:inline">รีเฟรช</span>
          </Button>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
