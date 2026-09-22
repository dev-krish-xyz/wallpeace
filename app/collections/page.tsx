import type { Metadata } from "next";
import { CollectionCard } from "@/components/gallery/CollectionCard";
import { EmptyLibrary } from "@/components/gallery/EmptyLibrary";
import { PageBody, PageHeader } from "@/components/site/Section";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getCollections } from "@/lib/collections";
import { isSupabaseConfigured } from "@/lib/env";
import { getWallpapers, inCollection } from "@/lib/wallpapers";

export const metadata: Metadata = {
  title: "Collections",
  description: "Wallpapers grouped by mood and subject: minimal, dark, nature, illustration, architecture and more.",
  alternates: { canonical: "/collections" },
};

export default async function CollectionsPage() {
  const [all, categories] = await Promise.all([getWallpapers(), getCollections()]);
  // Only collections with something in them; the rest appear as soon as a wallpaper is tagged.
  const collections = categories.map((c) => ({ c, items: inCollection(all, c.slug) })).filter((x) => x.items.length);
  // Newest wallpaper not already covering another collection, so the covers don't repeat.
  const used = new Set<string>();
  const covers = collections.map(({ items }) => {
    const cover = items.find((w) => !used.has(w.id)) ?? items[0];
    used.add(cover.id);
    return cover;
  });

  return (
    <>
      <SiteHeader />
      <PageBody>
        <PageHeader title="Collections" subtitle="Wallpapers grouped by mood and subject." />
        {collections.length ? (
          <ul className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map(({ c, items }, i) => (
              <li key={c.slug}>
                <CollectionCard collection={c} wallpapers={items} cover={covers[i]} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyLibrary configured={isSupabaseConfigured} />
        )}
      </PageBody>
    </>
  );
}
