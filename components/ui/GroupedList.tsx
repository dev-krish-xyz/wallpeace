/** Inset grouped list, as in System Settings. */
export function GroupedList({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section>
      {title && <h3 className="mb-1.5 px-3 text-[12px] font-semibold text-label-2">{title}</h3>}
      <div className="overflow-hidden rounded-[10px] bg-grouped ring-[0.5px] ring-separator">
        <div className="divide-y divide-separator">{children}</div>
      </div>
    </section>
  );
}

export function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-4 px-3.5 py-2 text-[13px]">
      <span className="text-label">{label}</span>
      <span className="truncate text-right text-label-2 tabular-nums">{children}</span>
    </div>
  );
}
