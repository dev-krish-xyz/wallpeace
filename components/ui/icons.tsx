// SF Symbols–style glyphs: 1.75 stroke, rounded caps, drawn on a 20×20 grid.
type IconProps = React.SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props,
});

export const ChevronLeft = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12.5 4.5 7 10l5.5 5.5" />
  </svg>
);

export const ChevronRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7.5 4.5 13 10l-5.5 5.5" />
  </svg>
);

export const ArrowDown = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M10 3.5v10M5.5 9.5 10 14l4.5-4.5M4.5 17h11" />
  </svg>
);

export const Photo = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2.5" y="4" width="15" height="12" rx="2.5" />
    <path d="m2.8 13.5 4-3.8 3.4 3 2.3-2 4.6 3.9" />
    <circle cx="13" cy="7.7" r="1.2" />
  </svg>
);

export const Plus = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M10 4v12M4 10h12" />
  </svg>
);

export const Check = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m4.5 10.5 3.5 3.5 7.5-8" />
  </svg>
);

export const XMark = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m5.5 5.5 9 9m0-9-9 9" />
  </svg>
);

export const Expand = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M11.5 3.5h5v5M8.5 16.5h-5v-5M16.5 3.5 11 9M3.5 16.5 9 11" />
  </svg>
);

export const Collapse = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M11 4v5h5M9 16v-5H4M11 9l5.5-5.5M9 11l-5.5 5.5" />
  </svg>
);

export const StarFill = (p: IconProps) => (
  <svg {...base({ fill: "currentColor", strokeWidth: 1.25, ...p })}>
    <path d="m10 2.8 2.2 4.5 5 .7-3.6 3.5.85 4.95L10 14.1l-4.45 2.35.85-4.95L2.8 8l5-.7z" />
  </svg>
);

export const Menu = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3.5 6h13M3.5 10h13M3.5 14h13" />
  </svg>
);

// --- Premium feature glyphs ------------------------------------------------------------------

/** Resolution: a frame with a corner pulled out. */
export const Resolution = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2.75" y="4.25" width="14.5" height="11.5" rx="2.25" />
    <path d="M7.5 12.5V7.5h5M12.5 12.5H10" />
  </svg>
);

/** Screen variations: a desktop with a phone beside it. */
export const Devices = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2.5 5.25A1.75 1.75 0 0 1 4.25 3.5h7a1.75 1.75 0 0 1 1.75 1.75v6.25M5.5 15h4" />
    <rect x="14.25" y="7.5" width="3.5" height="8.5" rx="1.25" />
  </svg>
);

/** Multi-monitor: three panels in a row. */
export const Displays = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="1.5" y="5.5" width="5" height="9" rx="1.25" />
    <rect x="7.5" y="5.5" width="5" height="9" rx="1.25" />
    <rect x="13.5" y="5.5" width="5" height="9" rx="1.25" />
  </svg>
);

/** Live: a play mark inside a rounded frame. */
export const Live = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2.75" y="3.75" width="14.5" height="12.5" rx="2.5" />
    <path d="m8.5 7.75 4 2.25-4 2.25z" fill="currentColor" strokeWidth="1.25" />
  </svg>
);

/** Dynamic day to night: a sun rising over a horizon. */
export const Daylight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2.5 14.5h15" />
    <circle cx="10" cy="10.5" r="3.25" />
    <path d="M10 3.5v1.5M4.4 5.4l1.1 1.1M15.6 5.4l-1.1 1.1M2.75 10.5h1.5M15.75 10.5h1.5" />
  </svg>
);

/** Exclusive series: cards stacked behind one another. */
export const Series = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="6.5" y="3" width="11" height="11" rx="2.25" />
    <path d="M13.5 17H5A2.5 2.5 0 0 1 2.5 14.5V6.5" />
  </svg>
);

/** A custom request: a message with a spark in it. */
export const Request = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M17 10.5a6 6 0 0 1-6 6H7l-3.5 2 .8-3A6 6 0 0 1 9 4.5h2a6 6 0 0 1 6 6Z" />
    <path d="m10 7.5.9 1.85 1.85.9-1.85.9-.9 1.85-.9-1.85-1.85-.9 1.85-.9z" fill="currentColor" strokeWidth="1" />
  </svg>
);

/** The whole library, as a grid of wallpapers. */
export const Library = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.75" />
    <rect x="11" y="2.5" width="6.5" height="6.5" rx="1.75" />
    <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.75" />
    <rect x="11" y="11" width="6.5" height="6.5" rx="1.75" />
  </svg>
);
