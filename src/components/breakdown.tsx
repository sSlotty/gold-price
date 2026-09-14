"use client";

import {
  METALS,
  isPriced,
  money,
  number,
  signedMoney,
  signedPercent,
  toThaiDate,
  type Row,
  type Totals,
} from "@/lib/gold";
import { IconTrendDown, IconTrendUp } from "./icons";
import { Card, Eyebrow } from "./ui";

function ProfitCell({ row }: { row: Row }) {
  if (!isPriced(row)) return <span className="text-fg-subtle">—</span>;
  const up = row.profit >= 0;
  const Trend = up ? IconTrendUp : IconTrendDown;
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium ${up ? "text-pos" : "text-neg"}`}
    >
      <Trend />
      <span className="nums-tabular">{signedMoney(row.profit)}</span>
      <span className="sr-only">{up ? "กำไร" : "ขาดทุน"}</span>
    </span>
  );
}

const HEADERS = [
  "วันที่ซื้อ",
  "ประเภท",
  "เงินต้น",
  "ราคาอ้างอิง",
  "น้ำหนัก",
  "มูลค่าวันนี้",
  "กำไร/ขาดทุน",
];

export function Breakdown({ rows, totals }: { rows: Row[]; totals: Totals }) {
  if (rows.length === 0) return null;

  return (
    <Card className="screen-only overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <Eyebrow>รายละเอียด</Eyebrow>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">
            การคำนวณรายรายการ
          </h2>
        </div>
        <p className="text-sm text-fg-muted">
          {rows.length} รายการ · น้ำหนักรวม{" "}
          <span className="nums-tabular">{number(totals.weight)}</span> บาททอง
        </p>
      </div>

      {/* Desktop: a real table, so screen readers announce row/column headers. */}
      <div className="hidden md:block">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            ตารางแสดงเงินต้น ราคาอ้างอิง น้ำหนัก มูลค่าปัจจุบัน และกำไรขาดทุนของแต่ละรายการ
          </caption>
          <thead>
            <tr className="border-b border-line bg-surface-2">
              {HEADERS.map((header, index) => (
                <th
                  key={header}
                  scope="col"
                  className={`px-4 py-2.5 text-xs font-semibold text-fg-muted ${
                    index <= 1 ? "text-start" : "text-end"
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-line last:border-0">
                <th
                  scope="row"
                  className="nums-tabular px-4 py-3 text-start font-normal whitespace-nowrap"
                >
                  {row.date ? toThaiDate(row.date) : "—"}
                </th>
                <td className="px-4 py-3 whitespace-nowrap">
                  {METALS[row.metal].short}
                  <span className="ms-1 text-xs text-fg-subtle">
                    {METALS[row.metal].purity}
                  </span>
                </td>
                <td className="nums-tabular px-4 py-3 text-end whitespace-nowrap">
                  {money(row.amount)}
                </td>
                <td className="nums-tabular px-4 py-3 text-end whitespace-nowrap text-fg-muted">
                  {row.price ? money(row.price) : "ไม่พบราคา"}
                </td>
                <td className="nums-tabular px-4 py-3 text-end whitespace-nowrap text-fg-muted">
                  {isPriced(row) ? number(row.weight) : "—"}
                </td>
                <td className="nums-tabular px-4 py-3 text-end font-medium whitespace-nowrap">
                  {isPriced(row) ? money(row.net) : "—"}
                </td>
                <td className="px-4 py-3 text-end whitespace-nowrap">
                  <ProfitCell row={row} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-line bg-surface-2 font-medium">
              <th scope="row" className="px-4 py-3 text-start">
                รวม
              </th>
              <td className="px-4 py-3" />
              <td className="nums-tabular px-4 py-3 text-end">
                {money(totals.principal)}
              </td>
              <td className="px-4 py-3" />
              <td className="nums-tabular px-4 py-3 text-end">{number(totals.weight)}</td>
              <td className="nums-tabular px-4 py-3 text-end">{money(totals.value)}</td>
              <td
                className={`nums-tabular px-4 py-3 text-end ${
                  totals.profit >= 0 ? "text-pos" : "text-neg"
                }`}
              >
                {signedMoney(totals.profit)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mobile: one card per entry instead of a 930px-wide sideways scroll. */}
      <ul className="flex list-none flex-col gap-px bg-line md:hidden">
        {rows.map((row) => (
          <li key={row.id} className="bg-surface px-4 py-3.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium">
                <span className="nums-tabular">
                  {row.date ? toThaiDate(row.date) : "ไม่ระบุวันที่"}
                </span>
                <span className="ms-2 text-xs font-normal text-fg-subtle">
                  {METALS[row.metal].short} {METALS[row.metal].purity}
                </span>
              </span>
              <ProfitCell row={row} />
            </div>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-fg-subtle">เงินต้น</dt>
                <dd className="nums-tabular">{money(row.amount)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-fg-subtle">มูลค่าวันนี้</dt>
                <dd className="nums-tabular font-medium">
                  {isPriced(row) ? money(row.net) : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-fg-subtle">น้ำหนัก</dt>
                <dd className="nums-tabular text-fg-muted">
                  {isPriced(row) ? `${number(row.weight)} บ.` : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-fg-subtle">ผลตอบแทน</dt>
                <dd
                  className={`nums-tabular ${
                    isPriced(row) ? (row.profit >= 0 ? "text-pos" : "text-neg") : "text-fg-muted"
                  }`}
                >
                  {isPriced(row) ? signedPercent(row.profitPercent) : "—"}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </Card>
  );
}
