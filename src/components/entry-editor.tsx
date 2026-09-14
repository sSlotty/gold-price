"use client";

import { useId } from "react";
import {
  entryIssue,
  money,
  parseAmount,
  toThaiDate,
  todayIso,
  type Entry,
  type Row,
} from "@/lib/gold";
import { IconPlus, IconTrash } from "./icons";
import { Button, inputClass } from "./ui";

const ISSUE_MESSAGE = {
  date: "เลือกวันที่ที่ไม่เกินวันนี้",
  amount: "จำนวนเงินต้องมากกว่า 0",
} as const;

function EntryRow({
  entry,
  row,
  index,
  onUpdate,
  onRemove,
}: {
  entry: Entry;
  row: Row | undefined;
  index: number;
  onUpdate: (id: string, field: "date" | "amount", value: string) => void;
  onRemove: (id: string) => void;
}) {
  const uid = useId();
  const dateId = `${uid}-date`;
  const amountId = `${uid}-amount`;
  const issue = entryIssue(entry);
  const amount = parseAmount(entry.amount);

  return (
    <li className="rounded-lg border border-line bg-surface-2 p-3 transition-colors focus-within:border-accent-ring">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-fg-subtle">
          รายการที่ {index + 1}
        </span>
        <Button
          variant="danger"
          size="sm"
          onClick={() => onRemove(entry.id)}
          aria-label={`ลบรายการที่ ${index + 1}`}
        >
          <IconTrash />
          <span className="sr-only sm:not-sr-only">ลบ</span>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor={dateId} className="text-xs font-medium text-fg-muted">
            วันที่ซื้อ
          </label>
          <input
            id={dateId}
            type="date"
            max={todayIso()}
            value={entry.date}
            onChange={(event) => onUpdate(entry.id, "date", event.target.value)}
            aria-invalid={issue === "date"}
            aria-describedby={`${dateId}-note`}
            className={`${inputClass} nums-tabular`}
          />
          <p id={`${dateId}-note`} className="text-xs text-fg-subtle">
            {issue === "date" ? (
              <span className="text-neg">{ISSUE_MESSAGE.date}</span>
            ) : entry.date ? (
              <>พ.ศ. {toThaiDate(entry.date)}</>
            ) : (
              "ยังไม่ได้เลือกวันที่"
            )}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={amountId} className="text-xs font-medium text-fg-muted">
            จำนวนเงินที่ซื้อ (บาท)
          </label>
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 start-3 grid place-items-center text-fg-subtle"
            >
              ฿
            </span>
            <input
              id={amountId}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              value={entry.amount}
              onChange={(event) => onUpdate(entry.id, "amount", event.target.value)}
              aria-invalid={issue === "amount"}
              aria-describedby={`${amountId}-note`}
              className={`${inputClass} nums-tabular ps-7 text-end`}
            />
          </div>
          <p id={`${amountId}-note`} className="text-xs text-fg-subtle">
            {issue === "amount" ? (
              <span className="text-neg">{ISSUE_MESSAGE.amount}</span>
            ) : row && row.price === null && entry.date ? (
              <span className="text-fg-muted">ไม่พบราคาทองของวันนี้</span>
            ) : amount ? (
              money(amount)
            ) : (
              "กรอกยอดเงินที่จ่ายจริง"
            )}
          </p>
        </div>
      </div>
    </li>
  );
}

export function EntryEditor({
  entries,
  rows,
  onUpdate,
  onRemove,
  onAdd,
}: {
  entries: Entry[];
  rows: Row[];
  onUpdate: (id: string, field: "date" | "amount", value: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}) {
  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line-strong px-5 py-10 text-center">
        <p className="font-medium">ยังไม่มีรายการ</p>
        <p className="mx-auto mt-1 max-w-xs text-sm text-fg-muted">
          เพิ่มวันที่และจำนวนเงินที่คุณซื้อทอง แล้วระบบจะคำนวณมูลค่าปัจจุบันให้อัตโนมัติ
        </p>
        <Button variant="primary" className="mt-4" onClick={onAdd}>
          <IconPlus />
          เพิ่มรายการแรก
        </Button>
      </div>
    );
  }

  return (
    <>
      <ul className="flex list-none flex-col gap-2.5">
        {entries.map((entry, index) => (
          <EntryRow
            key={entry.id}
            entry={entry}
            row={rows[index]}
            index={index}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        ))}
      </ul>
      <Button variant="secondary" className="mt-3 w-full" onClick={onAdd}>
        <IconPlus />
        เพิ่มรายการ
      </Button>
    </>
  );
}
