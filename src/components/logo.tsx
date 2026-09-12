/**
 * Aurum's mark: a cast gold bar seen slightly from above.
 *
 * Two tones drawn from a single `currentColor` — the top face is the same
 * colour at lower opacity — so the mark inherits whatever gold the active
 * theme defines and needs no per-theme variant. Geometry is kept to four
 * straight edges per face so it still reads at 16px in a browser tab.
 */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={`h-[1em] w-[1em] shrink-0 ${className}`}
    >
      {/* top face */}
      <path d="M6.5 7.5h11l2 3.5h-15z" opacity="0.45" />
      {/* front face */}
      <path d="M4.5 11h15L21 17H3z" />
    </svg>
  );
}

/** Mark plus wordmark, as used in the header. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-gold-soft text-[1.375rem] text-gold">
        <LogoMark />
      </span>
      <span className="text-lg leading-tight font-semibold tracking-tight">Aurum</span>
    </span>
  );
}
