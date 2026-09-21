import Link from "next/link";
import { formatResolution } from "@/lib/format";
import type { Wallpaper } from "@/types/database";
import { WallpaperImage } from "./WallpaperImage";

export function WallpaperCard({ wallpaper, index }: { wallpaper: Wallpaper; index: number }) {
  return (
    <Link
      href={`/w/${wallpaper.slug}`}
      className="group block rounded-[12px] animate-appear"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-[10px] bg-fill shadow-card transition-[box-shadow,transform] duration-500 ease-(--ease-mac) group-hover:-translate-y-0.5 group-hover:shadow-card-hover">
        <WallpaperImage
          wallpaper={wallpaper}
          sizes="(min-width: 1280px) 30vw, (min-width: 640px) 46vw, 92vw"
          priority={index < 3}
          className="transition-transform duration-700 ease-(--ease-mac) group-hover:scale-[1.015]"
        />
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3 px-0.5">
        <h3 className="truncate text-[13px] font-medium text-label">{wallpaper.title}</h3>
        <span className="shrink-0 text-[12px] text-label-3 tabular-nums">
          {formatResolution(wallpaper.width, wallpaper.height)}
        </span>
      </div>
    </Link>
  );
}
