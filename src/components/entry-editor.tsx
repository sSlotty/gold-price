"use client";

import { useId, useState } from "react";
import {
  METALS,
  METAL_KEYS,
  entryIssue,
  maskThaiDate,
  money,
  parseAmount,
  parseLooseDate,
  toGregorianDate,
  toThaiDate,
  type Entry,
  type Row,
} from "@/lib/gold";
import { IconPlus, IconTrash } from "./icons";
import { Button, Select, inputClass } from "./ui";

const ISSUE_MESSAGE = {
  date: "วันที่ต้องไม่เกินวันนี้",
  amount: "จำนวนเงินต้องมากกว่า 0",
} as const;

/**
 * A plain text field rather than `input[type=date]`.
 *
 * The native control renders in the device's locale — on a Thai iPhone that is
 * "21 Jan BE 2569" — and its format cannot be set from CSS or markup. Typing
 * digits into a masked text field gives the same dd/MM/yyyy everywhere, and
 * sidesteps the locale-driven intrinsic width that made the native control
 * outgrow the amount field beside it. The trade-off is the loss of the
 * platform date picker.
 */
function DateField({
  id,
  entry,
  invalid,
  onCommit,
}: {
  id: string;
  entry: Entry;
  invalid: boolean;
  onCommit: (iso: string) => void;
}) {
  const display = entry.date ? toThaiDate(entry.date) : "";
  const [draft, setDraft] = useState(display);
  // The last value this field itself wrote. Re-syncing the draft from the
  // entry on every change would fight the typist: half of "26012569" is
  // "26/01/25", a valid two-digit year, and committing it mid-keystroke
  // rewrote the box to "26/01/2525". Only an outside change — an import, an
  // undo — should replace what is being typed.
  const [ours, setOurs] = useState(entry.date);

  if (entry.date !== ours) {
    setOurs(entry.date);
    setDraft(display);
  }

  const complete = /^\d{2}\/\d{2}\/\d{4}$/.test(draft);
  const unparseable = complete && !parseLooseDate(draft);

  return (
    <>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="วว/ดด/ปปปป"
        value={draft}
        onChange={(event) => {
          const masked = maskThaiDate(event.target.value);
          setDraft(masked);
          if (masked === "") {
            setOurs("");
            onCommit("");
            return;
          }
          // Wait for the whole dd/MM/yyyy before writing anything, so partial
          // input never lands in storage or moves the totals.
          if (!/^\d{2}\/\d{2}\/\d{4}$/.test(masked)) return;
          const iso = parseLooseDate(masked);
          if (!iso) return;
          setOurs(iso);
          onCommit(iso);
        }}
        onBlur={() => setDraft(entry.date ? toThaiDate(entry.date) : draft)}
        aria-invalid={invalid || unparseable}
        aria-describedby={`${id}-note`}
        className={`${inputClass} nums-tabular`}
      />
      <p id={`${id}-note`} className="text-xs text-fg-subtle">
        {invalid ? (
          <span className="text-neg">{ISSUE_MESSAGE.date}</span>
        ) : unparseable ? (
          <span className="text-neg">รูปแบบต้องเป็น วว/ดด/ปปปป</span>
        ) : entry.date ? (
          <>ค.ศ. {toGregorianDate(entry.date)}</>
        ) : (
          "พ.ศ. เช่น 21/01/2569"
        )}
      </p>
    </>
  );
}

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
  onUpdate: (id: string, field: "date" | "amount" | "metal", value: string) => void;
  onRemove: (id: string) => void;
}) {
  const uid = useId();
  const dateId = `${uid}-date`;
  const amountId = `${uid}-amount`;
  const metalId = `${uid}-metal`;
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

      <div className="grid grid-cols-2 gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <label htmlFor={dateId} className="text-xs font-medium text-fg-muted">
            วันที่ซื้อ
          </label>
          <DateField
            id={dateId}
            entry={entry}
            invalid={issue === "date"}
            onCommit={(iso) => onUpdate(entry.id, "date", iso)}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-1">
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

      <div className="mt-3 flex min-w-0 flex-col gap-1">
        <label htmlFor={metalId} className="text-xs font-medium text-fg-muted">
          ประเภททอง
        </label>
        <Select
          id={metalId}
          value={entry.metal}
          onChange={(event) => onUpdate(entry.id, "metal", event.target.value)}
          aria-describedby={`${metalId}-note`}
        >
          {METAL_KEYS.map((metal) => (
            <option key={metal} value={metal}>
              {METALS[metal].label}
            </option>
          ))}
        </Select>
        <p id={`${metalId}-note`} className="text-xs text-fg-subtle">
          {METALS[entry.metal].hint}
        </p>
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
  onUpdate: (id: string, field: "date" | "amount" | "metal", value: string) => void;
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
