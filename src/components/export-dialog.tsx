"use client";

import { useEffect, useId, useRef, useState } from "react";
import { isExportable, toEntriesText, todayIso, type Entry } from "@/lib/gold";
import { IconClose, IconDownload, IconPaste } from "./icons";
import { Button, inputClass } from "./ui";

/**
 * Exports the entries a person typed in — not the computed report, which is
 * what the CSV download covers. The text is written in exactly the shape the
 * import dialog parses, so it round-trips.
 */
export function ExportDialog({
  open,
  onClose,
  entries,
}: {
  open: boolean;
  onClose: () => void;
  entries: Entry[];
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);
  const uid = useId();

  const text = toEntriesText(entries);
  const exportable = entries.filter(isExportable).length;
  const incomplete = entries.length - exportable;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Clearing the flag from a timer callback keeps it out of the render path.
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const close = () => {
    setCopied(false);
    onClose();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard blocked (insecure origin, denied permission) — select the
      // text instead so a manual copy still works.
      const field = document.getElementById(`${uid}-text`) as HTMLTextAreaElement | null;
      field?.focus();
      field?.select();
    }
  };

  const download = () => {
    const blob = new Blob([text + "\n"], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aurum-entries-${todayIso()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <dialog
      ref={ref}
      onClose={close}
      aria-labelledby={`${uid}-title`}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-card border border-line bg-surface p-0 text-fg shadow-float backdrop:bg-black/50"
    >
      <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 id={`${uid}-title`} className="text-base font-semibold">
            ส่งออกรายการของคุณ
          </h2>
          <p className="mt-0.5 text-sm text-fg-muted">
            คัดลอกหรือบันทึกไว้เป็นไฟล์ แล้วนำกลับเข้ามาได้ด้วยปุ่ม “นำเข้า”
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={close} aria-label="ปิด">
          <IconClose />
        </Button>
      </div>

      <div className="px-5 py-4">
        <label htmlFor={`${uid}-text`} className="text-sm font-medium">
          รายการทั้งหมด
        </label>
        <textarea
          id={`${uid}-text`}
          readOnly
          value={text}
          rows={7}
          onFocus={(event) => event.currentTarget.select()}
          aria-describedby={`${uid}-note`}
          className={`${inputClass} nums-tabular mt-1.5 h-auto resize-y py-2.5 leading-relaxed`}
        />
        <p id={`${uid}-note`} className="mt-2 text-sm text-fg-muted">
          {exportable > 0 ? (
            <>ส่งออก {exportable} รายการ</>
          ) : (
            <span className="text-fg-subtle">ยังไม่มีรายการที่ส่งออกได้</span>
          )}
          {incomplete > 0 ? (
            <span className="text-neg"> · ข้าม {incomplete} รายการที่กรอกไม่ครบ</span>
          ) : null}
        </p>
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-4">
        <Button onClick={close}>เสร็จสิ้น</Button>
        <Button onClick={download} disabled={exportable === 0}>
          <IconDownload />
          ดาวน์โหลด .txt
        </Button>
        <Button variant="primary" onClick={copy} disabled={exportable === 0}>
          <IconPaste />
          {copied ? "คัดลอกแล้ว" : "คัดลอก"}
        </Button>
      </div>

      {/* Announced without stealing focus from the copy button. */}
      <p role="status" aria-live="polite" className="sr-only">
        {copied ? "คัดลอกรายการแล้ว" : ""}
      </p>
    </dialog>
  );
}
