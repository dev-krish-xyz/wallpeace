import type { Metadata } from "next";
import { EmptyLibrary } from "@/components/gallery/EmptyLibrary";
import Image from "next/image";
import Link from "next/link";
import { WallpaperGrid } from "@/components/gallery/WallpaperCard";
import { PremiumTeaser } from "@/components/site/Premium";
import { Reveal } from "@/components/site/Reveal";
import { PageBody, Section } from "@/components/site/Section";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Studio } from "@/components/studio/Studio";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowDown } from "@/components/ui/icons";
import { ResolutionBadge } from "@/components/ui/ResolutionBadge";
import { getCollections } from "@/lib/collections";
import { displayTitle, formatAspect, formatResolution } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/env";
import { displayUrl } from "@/lib/storage";
import { getWallpapers, inCollection } from "@/lib/wallpapers";
import type { Wallpaper } from "@/types/database";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [wallpapers, categories] = await Promise.all([getWallpapers(), getCollections()]); // newest first
  // Open on the middle of the list so there's something to scroll to in both directions.
  const initial = wallpapers[Math.floor(wallpapers.length / 2)];

  if (!initial) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-5 py-24">
          <EmptyLibrary configured={isSupabaseConfigured} />
        </main>
      </>
    );
  }

  const latest = wallpapers.slice(0, 6);
  const featured = wallpapers.filter((w) => w.featured);
  // The curated pick: the largest collection that is a real subset of the library.
  const curated = categories.map((c) => ({ c, items: inCollection(wallpapers, c.slug) }))
    .filter(({ items }) => items.length && items.length < wallpapers.length)
    .sort((a, b) => b.items.length - a.items.length)[0];

  // Prefer ones not already shown under New Wallpapers.
  const shown = new Set(latest.map((w) => w.id));
  const curatedPicks = curated
    ? [...curated.items.filter((w) => !shown.has(w.id)), ...curated.items.filter((w) => shown.has(w.id))].slice(0, 3)
    : [];

  return (
    <>
      <SiteHeader />
      <Studio
        wallpapers={wallpapers}
        initialId={initial.id}
        heading="Wallpeace — original desktop wallpapers"
        syncUrl={false}
      />

      <div className="border-t border-separator">
        <PageBody className="flex flex-col gap-16 lg:gap-20">
          <Section
            title="New Wallpapers"
            subtitle="Fresh from the studio."
            action={{ href: "/browse/latest", label: "See All" }}
          >
            <WallpaperGrid wallpapers={latest} />
          </Section>

          {featured.length > 0 && (
            <Section title="Featured" subtitle="Hand-picked favorites." action={{ href: "/browse", label: "See All" }}>
              <FeaturedList wallpapers={featured.slice(0, 4)} />
            </Section>
          )}

          {curated && (
            <Section
              eyebrow="Curated Collection"
              title={curated.c.name}
              subtitle={curated.c.blurb ?? undefined}
              action={{ href: `/collections/${curated.c.slug}`, label: "View Collection" }}
            >
              <WallpaperGrid wallpapers={curatedPicks} />
            </Section>
          )}

          <Reveal>
            <PremiumTeaser />
          </Reveal>

          <Reveal>
            <section className="rounded-[14px] bg-grouped px-6 py-14 text-center">
              <h2 className="font-display text-[22px] font-semibold tracking-[-0.015em] text-label">Browse the Library</h2>
              <p className="mx-auto mt-1 max-w-[46ch] text-[13px] leading-snug text-label-2">
                All {wallpapers.length} wallpapers, sorted by newest or most downloaded, or grouped into collections.
              </p>
              <div className="mt-5 flex justify-center gap-2">
                <ButtonLink href="/browse" variant="primary" size="sm">
                  Browse All
                </ButtonLink>
                <ButtonLink href="/collections" variant="secondary" size="sm">
                  Collections
                </ButtonLink>
              </div>
            </section>
          </Reveal>
        </PageBody>
      </div>
    </>
  );
}

/** The first featured wallpaper large with its details, the rest as regular cards. */
function FeaturedList({ wallpapers: [lead, ...rest] }: { wallpapers: Wallpaper[] }) {
  return (
    <div className="flex flex-col gap-7">
      <Reveal className="grid items-center gap-5 lg:grid-cols-[2fr_1fr] lg:gap-10">
        <Link href={`/w/${lead.slug}`} className="group block rounded-[12px] outline-offset-4">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[12px] bg-fill shadow-card transition-shadow duration-300 ease-(--ease-mac) group-hover:shadow-card-hover">
            <Image
              src={displayUrl(lead)}
              alt={`${displayTitle(lead.title)} desktop wallpaper`}
              fill
              sizes="(min-width: 1200px) 740px, (min-width: 1024px) 62vw, 100vw"
              placeholder={lead.blur_data_url ? "blur" : "empty"}
              blurDataURL={lead.blur_data_url ?? undefined}
              className="object-cover"
            />
          </div>
        </Link>
        <div className="min-w-0">
          <h3 className="font-display text-[22px] font-semibold tracking-[-0.015em] text-label">{displayTitle(lead.title)}</h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-label-2 tabular-nums">
            {formatResolution(lead.width, lead.height)}
            <ResolutionBadge width={lead.width} height={lead.height} />
            <span>· {formatAspect(lead.width, lead.height)}</span>
          </p>
          {lead.description && (
            <p className="mt-3 max-w-[46ch] text-[13px] leading-relaxed text-label-2">{lead.description}</p>
          )}
          <div className="mt-5 flex gap-2">
            <ButtonLink href={`/w/${lead.slug}`} variant="secondary" size="sm">
              Preview
            </ButtonLink>
            <ButtonLink href={`/w/${lead.slug}/download`} prefetch={false} variant="primary" size="sm">
              <ArrowDown width={14} height={14} />
              Download
            </ButtonLink>
          </div>
        </div>
      </Reveal>
      {rest.length > 0 && <WallpaperGrid wallpapers={rest} />}
    </div>
  );
}
