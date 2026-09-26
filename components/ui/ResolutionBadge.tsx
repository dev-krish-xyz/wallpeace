import { resolutionLabel } from "@/lib/format";

type Tone = "light" | "dark";

const TONE: Record<Tone, string> = {
  light: "bg-fill-2 text-label-2",
  dark: "bg-white/[0.14] text-white/85",
};

/**
 * The resolution chip, one shape for the whole site: the label under a thumbnail and the "8K" in a
 * sentence are the same object. Sized in `em`, so it reads right in a 13px paragraph and in a 22px
 * headline without a size prop, and toned to the text around it so it survives the dark panel.
 */
export function ResLabel({ children, tone = "light" }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span
      className={`inline-block rounded-[0.36em] px-[0.4em] py-[0.04em] align-[0.04em] text-[0.84em] leading-[1.4] font-semibold tracking-[0.02em] ${TONE[tone]}`}
    >
      {children}
    </span>
  );
}

/**
 * Prose with every 4K / 6K / 8K in it lifted out into a chip. Splitting on a capturing group keeps
 * the text between the matches, so the sentence comes back whole with the sizes marked up.
 */
export function withResLabels(text: string, tone: Tone = "light") {
  return text.split(/(\b\d+K\b)/g).map((part, i) =>
    /^\d+K$/.test(part) ? (
      <ResLabel key={i} tone={tone}>
        {part}
      </ResLabel>
    ) : (
      part
    ),
  );
}

/** Small label beside a pixel size. Empty when the image is below 4K. */
export function ResolutionBadge({ width, height, compact = false }: { width: number; height: number; compact?: boolean }) {
  const label = resolutionLabel(width, height);
  if (!label) return null;
  return (
    <span
      className={`bg-fill-2 font-semibold tracking-[0.02em] text-label-2 ${
        compact
          ? "rounded-[4px] px-[3px] py-px text-[7px] sm:px-1 sm:text-[9px]"
          : "rounded-[5px] px-1.5 py-px text-[9px] sm:text-[10px]"
      }`}
    >
      {label}
    </span>
  );
}
