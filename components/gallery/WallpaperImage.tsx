import Image from "next/image";
import { displayUrl } from "@/lib/storage";
import type { Wallpaper } from "@/types/database";

export function WallpaperImage({
  wallpaper,
  sizes,
  priority,
  className = "",
}: {
  wallpaper: Wallpaper;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={displayUrl(wallpaper)}
      alt={wallpaper.title}
      fill
      sizes={sizes}
      priority={priority}
      placeholder={wallpaper.blur_data_url ? "blur" : "empty"}
      blurDataURL={wallpaper.blur_data_url ?? undefined}
      className={`object-cover ${className}`}
    />
  );
}
