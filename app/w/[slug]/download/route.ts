import { NextResponse, after } from "next/server";
import { originalExt } from "@/lib/storage";
import { createSupabasePublic } from "@/lib/supabase/server";
import { getWallpaperBySlug } from "@/lib/wallpapers";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = await getWallpaperBySlug(slug);
  if (!w) return new NextResponse("Not found", { status: 404 });
  // Counts toward "Popular". Runs after the redirect is sent, so the download never waits on it.
  if (req.method === "GET") {
    after(async () => {
      await createSupabasePublic().rpc("count_download", { p_slug: w.slug });
    });
  }
  const url = new URL(w.file_url);
  url.searchParams.set("download", `${w.slug}.${originalExt(w)}`);
  return NextResponse.redirect(url, 302);
}
