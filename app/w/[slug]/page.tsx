import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Brand, Toolbar } from "@/components/ui/Toolbar";
import { Studio } from "@/components/studio/Studio";
import { formatResolution } from "@/lib/format";
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
  return {
    title: w.title,
    description: `${w.title}, an original ${formatResolution(w.width, w.height)} desktop wallpaper.`,
    openGraph: { images: [{ url: displayUrl(w), width: 2560, height: Math.round((2560 * w.height) / w.width) }] },
    twitter: { card: "summary_large_image" },
  };
}

/** Same studio as the home page, opened on a specific wallpaper (shareable link). */
export default async function WallpaperPage({ params }: Props) {
  const { slug } = await params;
  const [wallpaper, wallpapers] = await Promise.all([getWallpaperBySlug(slug), getWallpapers()]);
  if (!wallpaper) notFound();

  return (
    <>
      <Toolbar left={<Brand />} />
      <Studio wallpapers={wallpapers} initialId={wallpaper.id} />
    </>
  );
}
