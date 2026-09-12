"use client";

import { IconClose, IconUndo } from "./icons";
import { Button } from "./ui";

/** One-level undo for destructive actions, so nothing is lost irrecoverably. */
export function UndoToast({
  label,
  onUndo,
  onDismiss,
}: {
  label: string | null;
  onUndo: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="screen-only pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4"
    >
      {label ? (
        <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-2.5 shadow-float">
          <span className="text-sm">{label}</span>
          <Button size="sm" variant="secondary" onClick={onUndo}>
            <IconUndo />
            เลิกทำ
          </Button>
          <Button size="icon" variant="ghost" onClick={onDismiss} aria-label="ปิดการแจ้งเตือน">
            <IconClose />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
