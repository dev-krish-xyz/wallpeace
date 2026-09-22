import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/site/Reveal";
import { ResolutionBadge } from "@/components/ui/ResolutionBadge";
import { displayTitle, formatResolution } from "@/lib/format";
import { displayUrl } from "@/lib/storage";
import type { Wallpaper } from "@/types/database";

// Desktop-only: pointer devices get a gentle push-in on hover; touch screens never match hover:hover.
export const HOVER_ZOOM = " transition-transform duration-500 ease-(--ease-mac) [@media(hover:hover)]:group-hover:scale-[1.035]";

const SIZES = "(min-width: 1280px) 350px, (min-width: 1024px) 30vw, 50vw";

export function WallpaperCard({ wallpaper: w, sizes = SIZES, priority }: { wallpaper: Wallpaper; sizes?: string; priority?: boolean }) {
  return (
    <Link href={`/w/${w.slug}`} className="group block rounded-[12px] outline-offset-4">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[12px] bg-fill shadow-card transition-shadow duration-300 ease-(--ease-mac) group-hover:shadow-card-hover">
        <Image
          src={displayUrl(w)}
          alt={`${displayTitle(w.title)} desktop wallpaper`}
          fill
          sizes={sizes}
          priority={priority}
          placeholder={w.blur_data_url ? "blur" : "empty"}
          blurDataURL={w.blur_data_url ?? undefined}
          className={`object-cover${HOVER_ZOOM}`}
        />
      </div>
      <p className="mt-2.5 truncate text-[13px] font-medium text-label">{displayTitle(w.title)}</p>
      <p className="flex items-center gap-1 text-[11px] text-label-3 tabular-nums sm:gap-1.5 sm:text-[12px]">
        {formatResolution(w.width, w.height)}
        <ResolutionBadge width={w.width} height={w.height} compact />
      </p>
    </Link>
  );
}

export function WallpaperGrid({ wallpapers, priorityCount = 0 }: { wallpapers: Wallpaper[]; priorityCount?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-5 sm:gap-y-7 lg:grid-cols-3 xl:grid-cols-4">
      {wallpapers.map((w, i) => (
        <li key={w.id}>
          {/* Staggered along each row, so a row arrives as one gesture. */}
          <Reveal delay={(i % 4) * 70}>
            <WallpaperCard wallpaper={w} priority={i < priorityCount} />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
