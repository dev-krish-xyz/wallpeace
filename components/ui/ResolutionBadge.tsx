import { resolutionLabel } from "@/lib/format";

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
