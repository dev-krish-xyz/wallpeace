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

export const ArrowRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3.5 10h13M11 4.5 16.5 10 11 15.5" />
  </svg>
);

export const ArrowUpRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 14 14 6M6.8 6H14v7.2" />
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
// Drawn on the same 20x20 grid as the rest, and each one says what the feature is rather than
// gesturing at it: the resolution mark nests two frames, the screens mark is three real devices.

/** Resolution: a frame inside a frame, the way a larger master contains the smaller one. */
export const Resolution = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2.25" y="4" width="15.5" height="12" rx="2.25" />
    <rect x="6" y="7.25" width="8" height="5.5" rx="1.25" opacity="0.55" />
  </svg>
);

/** Screen variations: a desktop, a tablet and a phone, each its own shape. */
export const Devices = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="1.5" y="4.5" width="9" height="7" rx="1.5" />
    <path d="M4 14h4" />
    <rect x="12.25" y="4.5" width="6.25" height="11" rx="1.5" opacity="0.55" />
  </svg>
);

/** Multi-monitor: three panels on one desk line, the middle one square on. */
export const Displays = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="6.75" y="4.25" width="6.5" height="8" rx="1.25" />
    <path d="M1.75 5.75h3.5v7h-3.5zM14.75 5.75h3.5v7h-3.5z" opacity="0.55" />
    <path d="M2 15.5h16" />
  </svg>
);

/** Live: the play mark, with the motion coming off it. */
export const Live = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M8.25 6.5 13 10l-4.75 3.5z" />
    <path d="M3.4 5.4a6.5 6.5 0 0 0 0 9.2M16.6 5.4a6.5 6.5 0 0 1 0 9.2" opacity="0.55" />
  </svg>
);

/** Dynamic: the sun on one side of the line, the moon on the other. */
export const Daylight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M1.75 10.75h16.5" />
    <circle cx="6.25" cy="6.75" r="2.5" />
    <path d="M17 5.5a3.1 3.1 0 1 1-3.3-3.1A3.6 3.6 0 0 0 17 5.5Z" opacity="0.55" />
    <path d="M4 15.5h3.5M10 15.5h6" opacity="0.55" />
  </svg>
);

/** A series: one wallpaper in front, the rest of the set behind it. */
export const Series = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2.25" y="6.5" width="11.5" height="9.5" rx="2" />
    <path d="M5.75 4.25h9a2.5 2.5 0 0 1 2.5 2.5v6.5" opacity="0.55" />
  </svg>
);

/** A request: what you asked for, and the spark that answers it. */
export const Request = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M17 9.75a5.75 5.75 0 0 1-5.75 5.75H7.5L3.75 17.5l.9-3.1A5.75 5.75 0 0 1 8.25 4h3a5.75 5.75 0 0 1 5.75 5.75Z" />
    <path d="m11 6.75.75 1.75 1.75.75-1.75.75-.75 1.75-.75-1.75L8.5 9.25l1.75-.75z" opacity="0.55" />
  </svg>
);

/** The library: a wall of wallpapers, one of them yours. */
export const Library = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2.25" y="2.75" width="6.5" height="6.5" rx="1.5" />
    <rect x="11.25" y="2.75" width="6.5" height="6.5" rx="1.5" opacity="0.55" />
    <rect x="2.25" y="10.75" width="6.5" height="6.5" rx="1.5" opacity="0.55" />
    <rect x="11.25" y="10.75" width="6.5" height="6.5" rx="1.5" />
  </svg>
);
