import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WallpaperGrid } from "@/components/gallery/WallpaperCard";
import { PageBody, PageHeader } from "@/components/site/Section";
import { SiteHeader } from "@/components/site/SiteHeader";
import { ChevronLeft } from "@/components/ui/icons";
import { getCollection, getCollections } from "@/lib/collections";
import { getWallpapers, inCollection } from "@/lib/wallpapers";

type Props = { params: Promise<{ slug: string }> };

// A category added in admin gets its page on first request, without a rebuild.
export async function generateStaticParams() {
  return (await getCollections()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const collection = await getCollection((await params).slug);
  if (!collection) return {};
  const items = inCollection(await getWallpapers(), collection.slug);
  return {
    title: `${collection.name} Wallpapers`,
    description: collection.blurb ?? `${collection.name} desktop wallpapers, made for Wallpeace.`,
    alternates: { canonical: `/collections/${collection.slug}` },
    // An empty collection is a thin page; keep it out of search until it has wallpapers.
    robots: items.length ? undefined : { index: false },
  };
}

export default async function CollectionPage({ params }: Props) {
  const collection = await getCollection((await params).slug);
  if (!collection) notFound();
  const items = inCollection(await getWallpapers(), collection.slug);

  return (
    <>
      <SiteHeader />
      <PageBody>
        <Link
          href="/collections"
          className="mb-3 -ml-1 inline-flex items-center gap-0.5 rounded-md text-[13px] font-medium text-accent hover:underline"
        >
          <ChevronLeft width={14} height={14} />
          Collections
        </Link>
        <PageHeader
          title={collection.name}
          subtitle={`${collection.blurb ?? ""} ${items.length} ${items.length === 1 ? "wallpaper" : "wallpapers"}.`}
        />
        {items.length ? (
          <WallpaperGrid wallpapers={items} priorityCount={3} />
        ) : (
          <p className="rounded-[14px] bg-grouped px-6 py-20 text-center text-[13px] text-label-2">
            Nothing here yet. New wallpapers are added regularly.
          </p>
        )}
      </PageBody>
    </>
  );
}
