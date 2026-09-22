import type { MetadataRoute } from "next";
import { COLLECTIONS } from "@/lib/collections";
import { SITE_URL } from "@/lib/env";
import { displayUrl } from "@/lib/storage";
import { getWallpapers, inCollection } from "@/lib/wallpapers";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const wallpapers = await getWallpapers();
  return [
    { url: SITE_URL, lastModified: wallpapers[0]?.created_at, changeFrequency: "weekly", priority: 1 },
    ...["/browse", "/browse/latest", "/browse/popular", "/collections"].map((p) => ({
      url: `${SITE_URL}${p}`,
      lastModified: wallpapers[0]?.created_at,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    // Empty collections are noindex, so they stay out of the sitemap too.
    ...COLLECTIONS.filter((c) => inCollection(wallpapers, c.slug).length).map((c) => ({
      url: `${SITE_URL}/collections/${c.slug}`,
      lastModified: inCollection(wallpapers, c.slug)[0]?.created_at,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    { url: `${SITE_URL}/premium`, changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${SITE_URL}/about`, changeFrequency: "yearly" as const, priority: 0.3 },
    ...wallpapers.map((w) => ({
      url: `${SITE_URL}/w/${w.slug}`,
      lastModified: w.created_at,
      changeFrequency: "yearly" as const,
      priority: 0.8,
      images: [displayUrl(w)],
    })),
  ];
}
