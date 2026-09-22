import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Brand, Toolbar } from "@/components/ui/Toolbar";
import { Studio } from "@/components/studio/Studio";
import { Credits } from "@/components/studio/Credits";
import { formatResolution } from "@/lib/format";
import { displayUrl } from "@/lib/storage";
import { getWallpaperWithNeighbors, getWallpapers } from "@/lib/wallpapers";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const wallpapers = await getWallpapers();
  return wallpapers.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getWallpaperWithNeighbors(slug);
  if (!data) return {};
  const { wallpaper: w } = data;
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
  const [data, wallpapers] = await Promise.all([getWallpaperWithNeighbors(slug), getWallpapers()]);
  if (!data) notFound();

  return (
    <>
      <Toolbar left={<Brand />} right={<Credits />} />
      <Studio wallpapers={wallpapers} initialId={data.wallpaper.id} />
    </>
  );
}
