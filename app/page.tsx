import { Brand, Toolbar } from "@/components/ui/Toolbar";
import { EmptyLibrary } from "@/components/gallery/EmptyLibrary";
import { Studio } from "@/components/studio/Studio";
import { Credits } from "@/components/studio/Credits";
import { isSupabaseConfigured } from "@/lib/env";
import { getWallpapers } from "@/lib/wallpapers";

export default async function HomePage() {
  const wallpapers = await getWallpapers();
  const initial = wallpapers.find((w) => w.featured) ?? wallpapers[0];

  return (
    <>
      <Toolbar left={<Brand />} right={<Credits />} />
      {initial ? (
        <Studio wallpapers={wallpapers} initialId={initial.id} />
      ) : (
        <main className="mx-auto max-w-2xl px-5 py-24">
          <EmptyLibrary configured={isSupabaseConfigured} />
        </main>
      )}
    </>
  );
}
