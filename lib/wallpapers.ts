import "server-only";
import { unstable_cache } from "next/cache";
import { WALLPAPERS_TAG, isSupabaseConfigured } from "@/lib/env";
import { createSupabasePublic } from "@/lib/supabase/server";
import type { Wallpaper } from "@/types/database";

export const WALLPAPER_COLUMNS = "id,title,slug,file_url,width,height,featured,description,blur_data_url,created_at";

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
  // Tags give instant refresh on publish; the timer catches edits made outside this deployment.
  { tags: [WALLPAPERS_TAG], revalidate: 300 },
);

export async function getWallpaperBySlug(slug: string) {
  const all = await getWallpapers();
  return all.find((w) => w.slug === slug) ?? null;
}
