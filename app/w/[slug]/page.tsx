import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Brand, Toolbar, ToolbarButton } from "@/components/ui/Toolbar";
import { ButtonLink } from "@/components/ui/Button";
import { GroupedList, Row } from "@/components/ui/GroupedList";
import { ArrowDown, ChevronLeft, ChevronRight } from "@/components/ui/icons";
import { PreviewStage } from "@/components/preview/PreviewStage";
import { KeyboardNav } from "@/components/preview/KeyboardNav";
import { formatAspect, formatDate, formatResolution } from "@/lib/format";
import { displayUrl, originalExt, screenUrl } from "@/lib/storage";
import { getWallpaperWithNeighbors, getWallpapers } from "@/lib/wallpapers";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const wallpapers = await getWallpapers();
  return wallpapers.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getWallpaperWithNeighbors(slug);
  if (!data) return {};
  const { wallpaper: w } = data;
  return {
    title: w.title,
    description: `${w.title}, an original ${formatResolution(w.width, w.height)} desktop wallpaper.`,
    openGraph: { images: [{ url: displayUrl(w), width: 2560, height: Math.round((2560 * w.height) / w.width) }] },
    twitter: { card: "summary_large_image" },
  };
}

export default async function WallpaperPage({ params }: Props) {
  const { slug } = await params;
  const data = await getWallpaperWithNeighbors(slug);
  if (!data) notFound();
  const { wallpaper: w, prev, next, position, total } = data;
  const prevHref = prev ? `/w/${prev.slug}` : null;
  const nextHref = next ? `/w/${next.slug}` : null;

  return (
    <>
      <KeyboardNav prev={prevHref} next={nextHref} />
      <Toolbar
        left={
          <>
            <ToolbarButton href="/" label="Back to library">
              <ChevronLeft width={17} height={17} />
            </ToolbarButton>
            <span className="hidden sm:contents">
              <Brand />
            </span>
          </>
        }
        center={<span className="hidden sm:inline">{w.title}</span>}
        right={
          <>
            <span className="mr-1 hidden text-[12px] text-label-3 tabular-nums md:inline">
              {position} of {total}
            </span>
            <div className="flex items-center">
              <ToolbarButton href={prevHref} label="Previous wallpaper">
                <ChevronLeft width={17} height={17} />
              </ToolbarButton>
              <ToolbarButton href={nextHref} label="Next wallpaper">
                <ChevronRight width={17} height={17} />
              </ToolbarButton>
            </div>
          </>
        }
      />

      <main className="mx-auto max-w-[1280px] px-5 pb-32 sm:px-8">
        <section className="pt-6 sm:pt-10 animate-appear">
          <PreviewStage screenUrl={screenUrl(w)} fallbackUrl={displayUrl(w)} title={w.title} />
        </section>

        <section className="mx-auto mt-14 grid max-w-[920px] gap-10 md:grid-cols-[1fr_320px] md:gap-16 animate-appear [animation-delay:120ms]">
          <div>
            {w.featured && <p className="mb-1 text-[12px] font-semibold text-accent">Featured</p>}
            <h1 className="font-display text-[28px] font-bold leading-tight tracking-[-0.02em] sm:text-[34px]">{w.title}</h1>
            <p className="mt-1.5 text-[15px] text-label-2">Added {formatDate(w.created_at)}</p>
            <ButtonLink
              href={`/w/${w.slug}/download`}
              prefetch={false}
              variant="primary"
              size="lg"
              className="mt-8 w-full sm:w-auto"
            >
              <ArrowDown width={17} height={17} />
              Download
            </ButtonLink>
          </div>
          <GroupedList title="Info">
            <Row label="Resolution">{formatResolution(w.width, w.height)}</Row>
            <Row label="Aspect Ratio">{formatAspect(w.width, w.height)}</Row>
            <Row label="Format">{originalExt(w).toUpperCase()}</Row>
            <Row label="Added">{formatDate(w.created_at)}</Row>
          </GroupedList>
        </section>
      </main>
    </>
  );
}
