import { Brand, Toolbar } from "@/components/ui/Toolbar";
import { FeaturedHero } from "@/components/gallery/FeaturedHero";
import { WallpaperCard } from "@/components/gallery/WallpaperCard";
import { EmptyLibrary } from "@/components/gallery/EmptyLibrary";
import { isSupabaseConfigured } from "@/lib/env";
import { getWallpapers } from "@/lib/wallpapers";

export default async function GalleryPage() {
  const wallpapers = await getWallpapers();
  const featured = wallpapers.find((w) => w.featured) ?? null;
  const rest = featured ? wallpapers.filter((w) => w.id !== featured.id) : wallpapers;

  return (
    <>
      <Toolbar
        left={<Brand />}
        right={
          wallpapers.length > 0 && (
            <span className="text-[13px] text-label-2 tabular-nums">
              {wallpapers.length} {wallpapers.length === 1 ? "Wallpaper" : "Wallpapers"}
            </span>
          )
        }
      />
      <main className="mx-auto max-w-[1440px] px-5 pb-32 sm:px-8 lg:px-12">
        <header className="pt-16 pb-12 sm:pt-24 sm:pb-16 animate-appear">
          <h1 className="font-display text-[34px] font-bold leading-[1.1] tracking-[-0.025em] text-label sm:text-[44px]">
            Wallpapers
          </h1>
          <p className="mt-2 max-w-md text-[15px] leading-relaxed text-label-2">
            Original desktop wallpapers, made one at a time. Preview any of them on a MacBook before you download.
          </p>
        </header>

        {wallpapers.length === 0 ? (
          <EmptyLibrary configured={isSupabaseConfigured} />
        ) : (
          <div className="space-y-20">
            {featured && <FeaturedHero wallpaper={featured} />}
            {rest.length > 0 && (
              <section>
                {featured && <h2 className="mb-5 px-0.5 text-[13px] font-semibold text-label-2">All Wallpapers</h2>}
                <div className="grid grid-cols-1 gap-x-7 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                  {rest.map((w, i) => (
                    <WallpaperCard key={w.id} wallpaper={w} index={i} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
      <footer className="mx-auto max-w-[1440px] border-t border-separator px-5 py-8 text-[12px] text-label-3 sm:px-8 lg:px-12">
        © {new Date().getFullYear()} Wallpeace. All wallpapers are original work.
      </footer>
    </>
  );
}
