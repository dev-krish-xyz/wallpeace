import { EmptyLibrary } from "@/components/gallery/EmptyLibrary";
import { WallpaperGrid } from "@/components/gallery/WallpaperCard";
import { SegmentedNav } from "@/components/ui/SegmentedNav";
import { isSupabaseConfigured } from "@/lib/env";
import { byDownloads, byFeatured, getWallpapers } from "@/lib/wallpapers";
import { PageBody, PageHeader } from "./Section";
import { SiteHeader } from "./SiteHeader";

const VIEWS = {
  all: { href: "/browse", label: "All", subtitle: "Every wallpaper in the library, featured first." },
  latest: { href: "/browse/latest", label: "Latest", subtitle: "The newest wallpapers, most recent first." },
  popular: { href: "/browse/popular", label: "Popular", subtitle: "The most downloaded wallpapers." },
} as const;

export type BrowseSort = keyof typeof VIEWS;

export const browseTitle = (sort: BrowseSort) => (sort === "all" ? "Browse" : `${VIEWS[sort].label} Wallpapers`);
export const browseDescription = (sort: BrowseSort) => VIEWS[sort].subtitle;

/** One of the three Browse pages; they differ only in order. */
export async function BrowseView({ sort }: { sort: BrowseSort }) {
  const all = await getWallpapers(); // newest first
  const wallpapers = sort === "all" ? byFeatured(all) : sort === "popular" ? byDownloads(all) : all;

  return (
    <>
      <SiteHeader />
      <PageBody>
        <PageHeader title="Browse" subtitle={`${all.length} original wallpapers. ${VIEWS[sort].subtitle}`}>
          <SegmentedNav
            label="Sort"
            current={VIEWS[sort].href}
            items={Object.values(VIEWS).map(({ href, label }) => ({ href, label }))}
          />
        </PageHeader>
        {wallpapers.length ? (
          <WallpaperGrid wallpapers={wallpapers} priorityCount={3} />
        ) : (
          <EmptyLibrary configured={isSupabaseConfigured} />
        )}
      </PageBody>
    </>
  );
}
