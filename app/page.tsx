import type { Metadata } from "next";
import { EmptyLibrary } from "@/components/gallery/EmptyLibrary";
import Image from "next/image";
import Link from "next/link";
import { WallpaperMarquee } from "@/components/gallery/WallpaperMarquee";
import { BrandBanner } from "@/components/site/BrandBanner";
import { Faq, SITE_FAQ } from "@/components/site/Faq";
import { PremiumTeaser } from "@/components/site/Premium";
import { PremiumShowcase } from "@/components/site/PremiumShowcase";
import { Pricing } from "@/components/site/Pricing";
import { Reveal } from "@/components/site/Reveal";
import { PageBody, Section } from "@/components/site/Section";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Studio } from "@/components/studio/Studio";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowDown } from "@/components/ui/icons";
import { ResolutionBadge } from "@/components/ui/ResolutionBadge";
import { displayTitle, formatAspect, formatResolution } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/env";
import { displayUrl } from "@/lib/storage";
import { getWallpapers } from "@/lib/wallpapers";
import type { Wallpaper } from "@/types/database";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const wallpapers = await getWallpapers(); // newest first
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

  // Two drifting rows, so the newest work gets more than a screenful of grid.
  const latest = wallpapers.slice(0, 14);
  const featured = wallpapers.filter((w) => w.featured);

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
          <BrandBanner />
          <Section
            eyebrow="Gallery"
            title="New Wallpapers"
            subtitle="Fresh from the studio, drifting past on their own."
            action={[
              { href: "/collections", label: "Browse Collections" },
              { href: "/browse/latest", label: "See All" },
            ]}
          >
            <WallpaperMarquee wallpapers={latest} />
          </Section>

          {featured.length > 0 && (
            <Section title="Featured" subtitle="Hand-picked favorites." action={{ href: "/browse", label: "See All" }}>
              <FeaturedLead wallpaper={featured[0]} />
            </Section>
          )}

          <Reveal>
            <PremiumTeaser />
          </Reveal>

          <PremiumShowcase wallpapers={wallpapers} />

          <Pricing />

          <Faq items={SITE_FAQ} subtitle="The short answers. The longer ones are on the premium page." />

          <Reveal>
            <section className="rounded-[14px] bg-grouped px-6 py-14 text-center">
              <h2 className="font-display text-[30px] font-semibold tracking-[-0.021em] text-label sm:text-[36px]">Browse the Library</h2>
              <p className="mx-auto mt-1.5 max-w-[46ch] text-[14px] leading-snug text-label-2 sm:text-[15px]">
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

/** One featured wallpaper, large, with its details beside it. */
function FeaturedLead({ wallpaper: lead }: { wallpaper: Wallpaper }) {
  return (
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
        <h3 className="font-display text-[30px] font-semibold tracking-[-0.021em] text-label sm:text-[36px]">{displayTitle(lead.title)}</h3>
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
  );
}
