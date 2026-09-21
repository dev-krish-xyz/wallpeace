import { NextResponse } from "next/server";
import { originalExt } from "@/lib/storage";
import { getWallpaperWithNeighbors } from "@/lib/wallpapers";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getWallpaperWithNeighbors(slug);
  if (!data) return new NextResponse("Not found", { status: 404 });
  const w = data.wallpaper;
  const url = new URL(w.file_url);
  url.searchParams.set("download", `${w.slug}.${originalExt(w)}`);
  return NextResponse.redirect(url, 302);
}
