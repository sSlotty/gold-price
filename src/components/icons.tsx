type IconProps = { className?: string };

const base = "h-[1em] w-[1em] shrink-0";

/** Decorative by default — every icon here sits beside a text label. */
const svg = (path: React.ReactNode, viewBox = "0 0 24 24") =>
  function Icon({ className = "" }: IconProps) {
    return (
      <svg
        viewBox={viewBox}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        className={`${base} ${className}`}
      >
        {path}
      </svg>
    );
  };

export const IconTrendUp = svg(
  <>
    <path d="M3 17 10 10l4 4 7-7" />
    <path d="M14 3h7v7" />
  </>,
);

export const IconTrendDown = svg(
  <>
    <path d="M3 7 10 14l4-4 7 7" />
    <path d="M14 21h7v-7" />
  </>,
);

export const IconRefresh = svg(
  <>
    <path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" />
    <path d="M3 21v-5h5" />
  </>,
);

export const IconDownload = svg(
  <>
    <path d="M12 3v12" />
    <path d="m7 11 5 5 5-5" />
    <path d="M4 20h16" />
  </>,
);

export const IconPrint = svg(
  <>
    <path d="M7 8V3h10v5" />
    <path d="M5 8h14a2 2 0 0 1 2 2v6h-4" />
    <path d="M5 16H3v-6a2 2 0 0 1 2-2" />
    <rect x="7" y="14" width="10" height="7" rx="1" />
  </>,
);

export const IconPlus = svg(
  <>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </>,
);

export const IconTrash = svg(
  <>
    <path d="M4 7h16" />
    <path d="M9 7V5h6v2" />
    <path d="M6 7l1 13h10l1-13" />
  </>,
);

export const IconPaste = svg(
  <>
    <rect x="8" y="3" width="8" height="4" rx="1" />
    <path d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
  </>,
);

export const IconSun = svg(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </>,
);

export const IconMoon = svg(<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />);

export const IconMonitor = svg(
  <>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </>,
);

export const IconAlert = svg(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v6M12 16.5v.01" />
  </>,
);

export const IconClose = svg(
  <>
    <path d="M6 6l12 12M18 6 6 18" />
  </>,
);

export const IconUndo = svg(
  <>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
  </>,
);
