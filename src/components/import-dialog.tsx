"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  newEntry,
  parseAmount,
  parseLooseDate,
  splitEntryLine,
  toThaiDate,
  type Entry,
} from "@/lib/gold";
import { IconClose } from "./icons";
import { Button, inputClass } from "./ui";

const PLACEHOLDER = `21/01/2569 : 91,558.15
21/01/2569 : 7,063.52
26/01/2569 : 74,814.51`;

type Parsed = { entries: Entry[]; skipped: number };

const parseText = (text: string): Parsed => {
  let skipped = 0;
  const entries = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line): Entry[] => {
      const [rawDate, rawAmount] = splitEntryLine(line);
      const date = parseLooseDate(rawDate);
      const amount = rawAmount.replaceAll(",", "").trim();
      if (!date || parseAmount(amount) <= 0) {
        skipped += 1;
        return [];
      }
      return [newEntry(date, amount)];
    });
  return { entries, skipped };
};

export function ImportDialog({
  open,
  onClose,
  onImport,
}: {
  open: boolean;
  onClose: () => void;
  onImport: (entries: Entry[]) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [text, setText] = useState("");
  const uid = useId();
  const preview = parseText(text);
  const close = () => {
    setText("");
    onClose();
  };

  // Native <dialog> gives focus trapping, Esc-to-close and inert background.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={close}
      aria-labelledby={`${uid}-title`}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-card border border-line bg-surface p-0 text-fg shadow-float backdrop:bg-black/50"
    >
      <form
        method="dialog"
        onSubmit={(event) => {
          if (event.nativeEvent instanceof SubmitEvent) {
            // Submitted via the import button — commit before the dialog closes.
            onImport(preview.entries);
            setText("");
          }
        }}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 id={`${uid}-title`} className="text-base font-semibold">
              นำเข้ารายการจากข้อความ
            </h2>
            <p className="mt-0.5 text-sm text-fg-muted">
              วางทีละบรรทัด รูปแบบ <code>วันที่ : จำนวนเงิน</code> รองรับทั้ง พ.ศ. และ ค.ศ.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={close} aria-label="ปิด">
            <IconClose />
          </Button>
        </div>

        <div className="px-5 py-4">
          <label htmlFor={`${uid}-text`} className="text-sm font-medium">
            ข้อมูลที่ต้องการนำเข้า
          </label>
          <textarea
            id={`${uid}-text`}
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={7}
            placeholder={PLACEHOLDER}
            aria-describedby={`${uid}-preview`}
            className={`${inputClass} nums-tabular mt-1.5 h-auto resize-y py-2.5 leading-relaxed`}
          />
          <p id={`${uid}-preview`} aria-live="polite" className="mt-2 text-sm">
            {text.trim() === "" ? (
              <span className="text-fg-subtle">ยังไม่มีข้อมูล</span>
            ) : (
              <>
                <span className="text-pos">อ่านได้ {preview.entries.length} รายการ</span>
                {preview.skipped > 0 ? (
                  <span className="text-neg"> · ข้าม {preview.skipped} บรรทัด</span>
                ) : null}
                {preview.entries[0] ? (
                  <span className="block text-xs text-fg-subtle">
                    เริ่มที่ {toThaiDate(preview.entries[0].date)}
                  </span>
                ) : null}
              </>
            )}
          </p>
          <p className="mt-3 rounded-lg bg-surface-2 px-3 py-2 text-xs text-fg-muted">
            การนำเข้าจะแทนที่รายการทั้งหมดที่มีอยู่ — กดเลิกทำได้ทันทีหลังนำเข้า
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
          <Button onClick={close}>ยกเลิก</Button>
          <Button type="submit" variant="primary" disabled={preview.entries.length === 0}>
            นำเข้า {preview.entries.length || ""} รายการ
          </Button>
        </div>
      </form>
    </dialog>
  );
}
