import Image from "next/image";
import Link from "next/link";
import type { Collection } from "@/lib/collections";
import { displayUrl } from "@/lib/storage";
import type { Wallpaper } from "@/types/database";

/** A collection, shown as a cover wallpaper with the name and count underneath. */
export function CollectionCard({
  collection,
  wallpapers,
  cover = wallpapers[0],
}: {
  collection: Collection;
  wallpapers: Wallpaper[];
  cover?: Wallpaper;
}) {
  return (
    <Link href={`/collections/${collection.slug}`} className="group block rounded-[12px] outline-offset-4">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[12px] bg-fill shadow-card transition-shadow duration-300 ease-(--ease-mac) group-hover:shadow-card-hover">
        {cover && (
          <Image
            src={displayUrl(cover)}
            alt=""
            fill
            sizes="(min-width: 1200px) 370px, (min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
            placeholder={cover.blur_data_url ? "blur" : "empty"}
            blurDataURL={cover.blur_data_url ?? undefined}
            className="object-cover"
          />
        )}
      </div>
      <div className="mt-2.5 flex items-baseline justify-between gap-3">
        <p className="truncate text-[15px] font-semibold tracking-[-0.01em] text-label">{collection.name}</p>
        <p className="shrink-0 text-[12px] text-label-3 tabular-nums">
          {wallpapers.length} {wallpapers.length === 1 ? "wallpaper" : "wallpapers"}
        </p>
      </div>
      <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-label-2">{collection.blurb}</p>
    </Link>
  );
}
