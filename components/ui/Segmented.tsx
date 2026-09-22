"use client";

import { SEGMENT, SEGMENTED_TRACK, SEGMENT_ACTIVE, SEGMENT_IDLE } from "./segmentedStyles";

/** macOS segmented control. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  className = "",
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={`${SEGMENTED_TRACK} ${className}`}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`${SEGMENT} px-[6.75px] ${active ? SEGMENT_ACTIVE : SEGMENT_IDLE}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
