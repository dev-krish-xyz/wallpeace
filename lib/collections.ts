import "server-only";
import { unstable_cache } from "next/cache";
import { CATEGORIES_TAG, isSupabaseConfigured } from "@/lib/env";
import { createSupabasePublic } from "@/lib/supabase/server";

export type Collection = { slug: string; name: string; blurb: string | null };

export const CATEGORY_COLUMNS = "slug,name,blurb,position";
export const MAX_CATEGORY_NAME = 60;
export const MAX_CATEGORY_BLURB = 200;

/** Every category, in the order they were given. Managed in admin, so it comes from the database. */
export const getCollections = unstable_cache(
  async (): Promise<Collection[]> => {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await createSupabasePublic()
      .from("categories")
      .select(CATEGORY_COLUMNS)
      .order("position")
      .order("name");
    if (error) throw new Error(`Failed to load categories: ${error.message}`);
    return data.map(({ slug, name, blurb }) => ({ slug, name, blurb }));
  },
  ["categories:all"],
  { tags: [CATEGORIES_TAG], revalidate: 300 },
);

export async function getCollection(slug: string) {
  return (await getCollections()).find((c) => c.slug === slug) ?? null;
}
