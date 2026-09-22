import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    // Download routes only redirect to the original file; not worth crawling.
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/w/*/download"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
