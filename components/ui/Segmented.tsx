"use client";

/** macOS segmented control. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-[8px] bg-fill-2 p-[2px] text-[12px] font-medium">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`h-[22px] rounded-[6px] px-3 transition-[background-color,color,box-shadow] duration-150 ${
              active
                ? "bg-surface text-label shadow-[0_0_0_0.5px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.14)]"
                : "text-label-2 hover:text-label"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
