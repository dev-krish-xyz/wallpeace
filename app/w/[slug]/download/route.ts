import { NextResponse } from "next/server";
import { originalExt } from "@/lib/storage";
import { getWallpaperBySlug } from "@/lib/wallpapers";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = await getWallpaperBySlug(slug);
  if (!w) return new NextResponse("Not found", { status: 404 });
  const url = new URL(w.file_url);
  url.searchParams.set("download", `${w.slug}.${originalExt(w)}`);
  return NextResponse.redirect(url, 302);
}
