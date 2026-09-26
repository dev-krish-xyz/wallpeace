/**
 * The shape behind each premium feature card: one large, soft object that says what the feature is
 * without spelling it out. Drawn rather than photographed so it scales, weighs nothing, and takes
 * its colour from the card it sits on.
 *
 * Every piece is on a 200x160 canvas, filled with the same two-stop gradient, and sits at the right
 * of the card with the text clear of it.
 */

export type ArtProps = { id: string; from: string; to: string; className?: string };

const svg = ({ id, from, to, className = "" }: ArtProps, children: React.ReactNode) => (
  <svg viewBox="0 0 200 160" fill="none" aria-hidden className={className}>
    {/* The gradient is keyed per instance: eight of these share a page and ids must not collide. */}
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={from} />
        <stop offset="100%" stopColor={to} />
      </linearGradient>
    </defs>
    <g fill={`url(#${id})`}>{children}</g>
  </svg>
);

/** Resolution: a frame holding a smaller frame, the master and the cut taken from it. */
export const ArtResolution = (p: ArtProps) =>
  svg(
    p,
    <>
      <rect x="18" y="20" width="164" height="120" rx="18" opacity="0.5" />
      <rect x="52" y="48" width="96" height="64" rx="12" opacity="0.9" />
    </>,
  );

/** Screen variations: the same picture cut to three different shapes. */
export const ArtDevices = (p: ArtProps) =>
  svg(
    p,
    <>
      <rect x="8" y="38" width="104" height="70" rx="10" opacity="0.85" />
      <rect x="120" y="26" width="46" height="94" rx="9" opacity="0.6" />
      <rect x="174" y="48" width="22" height="58" rx="6" opacity="0.45" />
    </>,
  );

/** Multi-monitor: three panels standing in a row, the middle one square on. */
export const ArtDisplays = (p: ArtProps) =>
  svg(
    p,
    <>
      <rect x="4" y="46" width="54" height="62" rx="8" opacity="0.45" />
      <rect x="66" y="34" width="68" height="86" rx="10" opacity="0.9" />
      <rect x="142" y="46" width="54" height="62" rx="8" opacity="0.45" />
    </>,
  );

/** Live: the play mark, with the motion still spreading out from it. */
export const ArtLive = (p: ArtProps) =>
  svg(
    p,
    <>
      <circle cx="100" cy="80" r="74" opacity="0.2" />
      <circle cx="100" cy="80" r="52" opacity="0.35" />
      <path d="M86 54 134 80 86 106z" opacity="0.95" />
    </>,
  );

/** Dynamic: the sun over a horizon that keeps moving under it. */
export const ArtDaylight = (p: ArtProps) =>
  svg(
    p,
    <>
      <circle cx="104" cy="66" r="40" opacity="0.9" />
      <path d="M0 116h200v10H0z" opacity="0.5" />
      <path d="M22 140c30-28 64-28 94 0 18-16 40-22 62-18v38H0v-20z" opacity="0.35" />
    </>,
  );

/** A series: the set, fanned, one of them in front. */
export const ArtSeries = (p: ArtProps) =>
  svg(
    p,
    <>
      <rect x="24" y="26" width="112" height="76" rx="12" opacity="0.3" transform="rotate(-9 80 64)" />
      <rect x="44" y="34" width="112" height="76" rx="12" opacity="0.5" transform="rotate(-3 100 72)" />
      <rect x="62" y="46" width="112" height="76" rx="12" opacity="0.9" />
    </>,
  );

/** A request: what you asked for, and the spark that answers it. */
export const ArtRequest = (p: ArtProps) =>
  svg(
    p,
    <>
      <path
        d="M34 24h108a26 26 0 0 1 26 26v44a26 26 0 0 1-26 26H86l-34 24 8-24h-26a26 26 0 0 1-26-26V50a26 26 0 0 1 26-26z"
        opacity="0.55"
      />
      <path d="m112 44 10 24 24 10-24 10-10 24-10-24-24-10 24-10z" opacity="0.95" />
    </>,
  );

/** The library: a wall of wallpapers, and one of them is the one you wanted. */
export const ArtLibrary = (p: ArtProps) =>
  svg(
    p,
    <>
      <rect x="14" y="16" width="80" height="60" rx="12" opacity="0.4" />
      <rect x="106" y="16" width="80" height="60" rx="12" opacity="0.85" />
      <rect x="14" y="88" width="80" height="60" rx="12" opacity="0.85" />
      <rect x="106" y="88" width="80" height="60" rx="12" opacity="0.4" />
    </>,
  );
