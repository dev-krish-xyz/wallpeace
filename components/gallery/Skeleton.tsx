/** Placeholders shown while a page's wallpapers are still loading. */
export function CardSkeleton() {
  return (
    <div>
      <div className="aspect-[16/10] animate-pulse rounded-[12px] bg-fill" />
      <div className="mt-2.5 h-[13px] w-2/5 animate-pulse rounded-full bg-fill" />
      <div className="mt-1.5 h-[11px] w-1/4 animate-pulse rounded-full bg-fill" />
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-5 sm:gap-y-7 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="mb-8">
      <div className="h-[28px] w-40 animate-pulse rounded-full bg-fill" />
      <div className="mt-2 h-[13px] w-64 animate-pulse rounded-full bg-fill" />
    </div>
  );
}
