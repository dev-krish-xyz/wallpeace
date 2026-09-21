"use client";

export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-[22px] w-[38px] shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-40 ${
        checked ? "bg-accent" : "bg-fill-2"
      }`}
    >
      <span
        className={`absolute left-[2px] size-[18px] rounded-full bg-white shadow-[0_0_0_0.5px_rgb(0_0_0/0.06),0_2px_4px_rgb(0_0_0/0.2)] transition-transform duration-200 ease-(--ease-mac) ${
          checked ? "translate-x-4" : ""
        }`}
      />
    </button>
  );
}
