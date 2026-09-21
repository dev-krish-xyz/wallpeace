import "server-only";
import { unstable_cache } from "next/cache";
import { WALLPAPERS_TAG, isSupabaseConfigured } from "@/lib/env";
import { createSupabasePublic } from "@/lib/supabase/server";
import type { Wallpaper } from "@/types/database";

export const WALLPAPER_COLUMNS = "id,title,slug,file_url,width,height,featured,blur_data_url,created_at";

/** Whole library, newest first. Small by design, so one cached list backs every page. */
export const getWallpapers = unstable_cache(
  async (): Promise<Wallpaper[]> => {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await createSupabasePublic()
      .from("wallpapers")
      .select(WALLPAPER_COLUMNS)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Failed to load wallpapers: ${error.message}`);
    return data;
  },
  ["wallpapers:all"],
  { tags: [WALLPAPERS_TAG] },
);

export async function getWallpaperWithNeighbors(slug: string) {
  const all = await getWallpapers();
  const index = all.findIndex((w) => w.slug === slug);
  if (index === -1) return null;
  return {
    wallpaper: all[index],
    prev: all[index - 1] ?? null,
    next: all[index + 1] ?? null,
    position: index + 1,
    total: all.length,
  };
}
