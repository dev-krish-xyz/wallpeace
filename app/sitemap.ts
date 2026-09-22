import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";
import { displayUrl } from "@/lib/storage";
import { getWallpapers } from "@/lib/wallpapers";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const wallpapers = await getWallpapers();
  return [
    { url: SITE_URL, lastModified: wallpapers[0]?.created_at, changeFrequency: "weekly", priority: 1 },
    ...wallpapers.map((w) => ({
      url: `${SITE_URL}/w/${w.slug}`,
      lastModified: w.created_at,
      changeFrequency: "yearly" as const,
      priority: 0.8,
      images: [displayUrl(w)],
    })),
  ];
}
