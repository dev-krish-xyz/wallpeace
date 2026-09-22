import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Brand, Toolbar } from "@/components/ui/Toolbar";
import { Studio } from "@/components/studio/Studio";
import { describeWallpaper } from "@/lib/format";
import { SITE_URL } from "@/lib/env";
import { displayUrl } from "@/lib/storage";
import { getWallpaperBySlug, getWallpapers } from "@/lib/wallpapers";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const wallpapers = await getWallpapers();
  return wallpapers.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const w = await getWallpaperBySlug(slug);
  if (!w) return {};
  const description = describeWallpaper(w);
  const image = { url: displayUrl(w), width: 2560, height: Math.round((2560 * w.height) / w.width), alt: w.title };
  return {
    title: w.title,
    description,
    alternates: { canonical: `/w/${w.slug}` },
    openGraph: { type: "website", siteName: "Wallpeace", url: `/w/${w.slug}`, title: w.title, description, images: [image] },
    twitter: { card: "summary_large_image", title: w.title, description, images: [image.url] },
  };
}

/** Same studio as the home page, opened on a specific wallpaper (shareable link). */
export default async function WallpaperPage({ params }: Props) {
  const { slug } = await params;
  const [wallpaper, wallpapers] = await Promise.all([getWallpaperBySlug(slug), getWallpapers()]);
  if (!wallpaper) notFound();

  const url = `${SITE_URL}/w/${wallpaper.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name: wallpaper.title,
    description: describeWallpaper(wallpaper),
    contentUrl: displayUrl(wallpaper),
    thumbnailUrl: displayUrl(wallpaper),
    url,
    width: wallpaper.width,
    height: wallpaper.height,
    encodingFormat: "image/webp",
    datePublished: wallpaper.created_at,
    creator: { "@type": "Organization", name: "Wallpeace", url: SITE_URL },
    creditText: "Wallpeace",
    copyrightNotice: "Wallpeace",
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Escape "<" so a title can never close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Toolbar left={<Brand />} />
      <Studio wallpapers={wallpapers} initialId={wallpaper.id} />
    </>
  );
}
