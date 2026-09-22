import type { Metadata } from "next";
import { Brand, Toolbar } from "@/components/ui/Toolbar";
import { EmptyLibrary } from "@/components/gallery/EmptyLibrary";
import { Studio } from "@/components/studio/Studio";
import { isSupabaseConfigured } from "@/lib/env";
import { getWallpapers } from "@/lib/wallpapers";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const wallpapers = await getWallpapers();
  // Open on the middle of the list so there's something to scroll to in both directions.
  const initial = wallpapers[Math.floor(wallpapers.length / 2)];

  return (
    <>
      <Toolbar left={<Brand />} />
      {initial ? (
        <Studio wallpapers={wallpapers} initialId={initial.id} heading="Wallpeace — original desktop wallpapers" />
      ) : (
        <main className="mx-auto max-w-2xl px-5 py-24">
          <EmptyLibrary configured={isSupabaseConfigured} />
        </main>
      )}
    </>
  );
}
