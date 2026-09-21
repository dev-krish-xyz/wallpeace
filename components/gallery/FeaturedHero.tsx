import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { Wallpaper } from "@/types/database";
import { WallpaperImage } from "./WallpaperImage";

export function FeaturedHero({ wallpaper }: { wallpaper: Wallpaper }) {
  return (
    <Link href={`/w/${wallpaper.slug}`} className="group block rounded-[16px] animate-appear">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[14px] bg-fill shadow-card transition-shadow duration-500 group-hover:shadow-card-hover sm:aspect-[21/9]">
        <WallpaperImage
          wallpaper={wallpaper}
          sizes="(min-width: 1440px) 1344px, 94vw"
          priority
          className="transition-transform duration-[1200ms] ease-(--ease-mac) group-hover:scale-[1.01]"
        />
      </div>
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-0.5">
        <div className="flex items-baseline gap-3">
          <span className="text-[12px] font-semibold text-accent">Featured</span>
          <h2 className="font-display text-[20px] font-semibold tracking-[-0.015em] text-label">{wallpaper.title}</h2>
        </div>
        <span className="text-[13px] text-label-2">{formatDate(wallpaper.created_at)}</span>
      </div>
    </Link>
  );
}
