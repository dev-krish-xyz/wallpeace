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
