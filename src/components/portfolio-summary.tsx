"use client";

import {
  METALS,
  money,
  number,
  signedMoney,
  signedPercent,
  type Totals,
} from "@/lib/gold";
import type { PriceStatus } from "@/hooks/use-gold-prices";
import { IconAlert, IconTrendDown, IconTrendUp } from "./icons";
import { Card, Eyebrow, Skeleton } from "./ui";

function StatTile({
  label,
  value,
  detail,
  loading,
}: {
  label: string;
  value: string;
  detail?: string;
  loading: boolean;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface-2 px-3.5 py-3">
      <dt className="text-xs text-fg-muted">{label}</dt>
      <dd className="mt-1">
        {loading ? (
          <Skeleton className="h-6 w-24" />
        ) : (
          <span className="block truncate text-lg font-semibold tracking-tight">
            {value}
          </span>
        )}
        {detail ? <span className="block text-xs text-fg-subtle">{detail}</span> : null}
      </dd>
    </div>
  );
}

export function PortfolioSummary({
  totals,
  status,
}: {
  totals: Totals;
  status: PriceStatus;
}) {
  const loading = status === "loading";
  const up = totals.profit >= 0;
  const Trend = up ? IconTrendUp : IconTrendDown;
  const empty = totals.priced === 0;

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line px-5 py-4">
        <Eyebrow>สรุปพอร์ต</Eyebrow>
        <p className="mt-1 text-sm text-fg-muted">
          มูลค่าปัจจุบันของทองที่คุณถืออยู่ หลังหักค่าธรรมเนียม
        </p>
      </div>

      <div className="px-5 py-5">
        {/* Hero figure — the one number this view leads with. */}
        <p className="text-sm text-fg-muted">มูลค่ารวมวันนี้</p>
        {loading ? (
          <Skeleton className="mt-2 h-12 w-56" />
        ) : (
          <p className="mt-1 truncate text-[clamp(2.25rem,7vw,3.25rem)] leading-[1.1] font-semibold tracking-tight">
            {money(totals.value)}
          </p>
        )}

        {/* Profit/loss: colour, an icon, a sign and a word — never colour alone. */}
        {loading ? (
          <Skeleton className="mt-3 h-7 w-40" />
        ) : empty ? (
          <p className="mt-3 text-sm text-fg-subtle">
            เพิ่มรายการเพื่อดูกำไร/ขาดทุน
          </p>
        ) : (
          <p
            className={`mt-3 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg px-2.5 py-1.5 text-sm font-medium ${
              up ? "bg-pos-soft text-pos" : "bg-neg-soft text-neg"
            }`}
          >
            <Trend />
            <span>{up ? "กำไร" : "ขาดทุน"}</span>
            <span className="nums-tabular">{signedMoney(totals.profit)}</span>
            <span className="nums-tabular opacity-80">
              ({signedPercent(totals.profitPercent)})
            </span>
          </p>
        )}

        <dl className="mt-5 grid grid-cols-2 gap-2.5">
          <StatTile
            label="เงินต้นรวม"
            value={money(totals.principal)}
            loading={loading}
          />
          <StatTile
            label="น้ำหนักรวม"
            value={`${number(totals.weight)} บาททอง`}
            loading={loading}
          />
          <StatTile
            label="ค่าธรรมเนียมรวม"
            value={money(totals.fees)}
            loading={loading}
          />
          <StatTile
            label="รายการที่คำนวณได้"
            value={`${totals.priced} รายการ`}
            detail={totals.unpriced ? `ไม่พบราคา ${totals.unpriced} รายการ` : undefined}
            loading={loading}
          />
        </dl>

        {/* What is actually held, by type — the reason types are per-entry. */}
        {!loading && totals.holdings.length > 0 ? (
          <div className="mt-5 border-t border-line pt-4">
            <p className="text-xs font-semibold tracking-[0.12em] text-fg-subtle uppercase">
              แยกตามประเภททอง
            </p>
            <ul className="mt-2.5 flex list-none flex-col gap-2">
              {totals.holdings.map((holding) => {
                const rising = holding.profit >= 0;
                return (
                  <li
                    key={holding.metal}
                    className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1"
                  >
                    <span className="text-sm">
                      {METALS[holding.metal].label}
                      <span className="ms-1.5 text-xs text-fg-subtle">
                        {holding.count} รายการ
                        {METALS[holding.metal].estimated ? " · ประมาณการ" : ""}
                      </span>
                    </span>
                    <span className="flex items-baseline gap-3">
                      <span className="nums-tabular text-sm text-fg-muted">
                        {number(holding.weight)} บาททอง
                      </span>
                      <span className="nums-tabular text-sm font-medium">
                        {money(holding.value)}
                      </span>
                      <span
                        className={`nums-tabular text-xs ${rising ? "text-pos" : "text-neg"}`}
                      >
                        {signedMoney(holding.profit)}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {status === "error" ? (
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-neg-soft px-3 py-2.5 text-sm text-neg">
            <IconAlert className="mt-1" />
            <span>
              ยังไม่สามารถดึงราคาจากสมาคมค้าทองคำได้ ตัวเลขด้านบนจึงยังไม่อัปเดต
              ลองกดรีเฟรชอีกครั้ง
            </span>
          </p>
        ) : null}
      </div>
    </Card>
  );
}
