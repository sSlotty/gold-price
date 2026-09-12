"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toApiDate, type GoldPrice } from "@/lib/gold";

export type PriceStatus = "loading" | "refreshing" | "ready" | "error";

type Result = {
  /** The request this result answers, so staleness is derivable, not stateful. */
  request: string;
  current: GoldPrice | null;
  historical: Record<string, GoldPrice | null>;
  updatedAt: string | null;
  error: boolean;
};

export function useGoldPrices(isoDates: string[]) {
  const [nonce, setNonce] = useState(0);
  const [result, setResult] = useState<Result | null>(null);

  // Stable key so re-renders with the same dates don't refetch.
  const dates = useMemo(
    () => [...new Set(isoDates.filter(Boolean).map(toApiDate))].sort().join(","),
    [isoDates],
  );
  const request = `${dates}#${nonce}`;

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/gold-price?dates=${encodeURIComponent(dates)}&r=${nonce}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`price request failed: ${response.status}`);
        return response.json();
      })
      .then((data) =>
        setResult({
          request: `${dates}#${nonce}`,
          current: data.current ?? null,
          historical: data.historical ?? {},
          updatedAt: data.updatedAt ?? null,
          error: false,
        }),
      )
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setResult((previous) => ({
          request: `${dates}#${nonce}`,
          current: previous?.current ?? null,
          historical: previous?.historical ?? {},
          updatedAt: previous?.updatedAt ?? null,
          error: true,
        }));
      });

    return () => controller.abort();
  }, [dates, nonce]);

  // Status is derived from what we have vs. what we asked for — while a newer
  // request is in flight the previous numbers stay on screen.
  const fresh = result?.request === request;
  const status: PriceStatus = fresh
    ? result.error
      ? "error"
      : "ready"
    : result
      ? "refreshing"
      : "loading";

  return {
    current: result?.current ?? null,
    historical: result?.historical ?? {},
    updatedAt: result?.updatedAt ?? null,
    status,
    refresh: useCallback(() => setNonce((value) => value + 1), []),
  };
}
