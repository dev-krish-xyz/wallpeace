import "server-only";
import { unstable_cache } from "next/cache";
import { WALLPAPERS_TAG, isSupabaseConfigured } from "@/lib/env";
import { createSupabasePublic } from "@/lib/supabase/server";
import type { Wallpaper } from "@/types/database";

export const WALLPAPER_COLUMNS = "id,title,slug,file_url,width,height,featured,description,collections,downloads,blur_data_url,created_at";

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

// The list above is newest first; these return new arrays in other orders.

/** Featured first, then newest: the default "All" order. */
export const byFeatured = (list: Wallpaper[]) => [...list].sort((a, b) => Number(b.featured) - Number(a.featured));

/** Most downloaded first; ties stay newest first. */
export const byDownloads = (list: Wallpaper[]) => [...list].sort((a, b) => b.downloads - a.downloads);

export const inCollection = (list: Wallpaper[], collection: string) =>
  list.filter((w) => w.collections.includes(collection));

/** Others to show under a wallpaper: same collections first (most overlap), then newest. */
export function relatedTo(w: Wallpaper, list: Wallpaper[], count: number) {
  const overlap = (o: Wallpaper) => o.collections.filter((c) => w.collections.includes(c)).length;
  return list
    .filter((o) => o.id !== w.id)
    .map((o, i) => ({ o, i, score: overlap(o) }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, count)
    .map(({ o }) => o);
}
