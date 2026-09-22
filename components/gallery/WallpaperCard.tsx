import Image from "next/image";
import Link from "next/link";
import { formatResolution } from "@/lib/format";
import { displayUrl } from "@/lib/storage";
import type { Wallpaper } from "@/types/database";

const SIZES = "(min-width: 1200px) 370px, (min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw";

export function WallpaperCard({ wallpaper: w, sizes = SIZES, priority }: { wallpaper: Wallpaper; sizes?: string; priority?: boolean }) {
  return (
    <Link href={`/w/${w.slug}`} className="group block rounded-[12px] outline-offset-4">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[12px] bg-fill shadow-card transition-shadow duration-300 ease-(--ease-mac) group-hover:shadow-card-hover">
        <Image
          src={displayUrl(w)}
          alt={`${w.title} desktop wallpaper`}
          fill
          sizes={sizes}
          priority={priority}
          placeholder={w.blur_data_url ? "blur" : "empty"}
          blurDataURL={w.blur_data_url ?? undefined}
          className="object-cover"
        />
      </div>
      <p className="mt-2.5 truncate text-[13px] font-medium text-label">{w.title}</p>
      <p className="text-[12px] text-label-3 tabular-nums">{formatResolution(w.width, w.height)}</p>
    </Link>
  );
}

export function WallpaperGrid({ wallpapers, priorityCount = 0 }: { wallpapers: Wallpaper[]; priorityCount?: number }) {
  return (
    <ul className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
      {wallpapers.map((w, i) => (
        <li key={w.id}>
          <WallpaperCard wallpaper={w} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
