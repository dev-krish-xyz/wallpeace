import Image from "next/image";
import { withResLabels } from "@/components/ui/ResolutionBadge";
import { displayTitle } from "@/lib/format";
import { premiumDemoAssets as ASSETS } from "@/lib/premium-demo-assets";
import { displayUrl } from "@/lib/storage";
import type { Wallpaper } from "@/types/database";
// The stacked (phone / reduced-motion) version plays V2's demos rather than keeping a third copy.
import { Dynamic, library, Live, MultiMonitor, Request, Resolution, Screens, Series, slot, Tier } from "../PremiumFeatureShowcaseV2/demos";
import { type Feature, InView, Journey } from "./Journey";

const REQUEST = "A quiet Japanese village at night, lanterns on, 16:10";

/**
 * V3 of "What Premium adds": one wallpaper carried through every feature, so the reader watches
 * what Premium does to a picture instead of reading what it includes. Kept apart from V1
 * (`PremiumShowcase`) and V2 so the three can be compared; it shares the devices, keyframes,
 * `DemoPlayer`, `LiveVideo` and `lib/premium-demo-assets.ts`.
 *
 * Wide screens get the scroll-driven journey. Phones — and anyone who has asked for reduced motion —
 * get the same chapters stacked, each playing its own short demo as it scrolls in.
 *
 * Meant to run edge to edge: give it the full width of the page, not a padded column.
 */
export function PremiumFeatureShowcaseV3({ wallpapers }: { wallpapers: Wallpaper[] }) {
  if (!wallpapers.length) return null;
  const pick = library(wallpapers);

  const hero = pick(ASSETS.resolution, 0);
  const thread = { src: displayUrl(hero), alt: `${displayTitle(hero.title)} wallpaper`, blur: hero.blur_data_url };
  const screens = pick(ASSETS.screens, 1);
  const panorama = pick(ASSETS.multiMonitor, 2);
  const liveStill = pick(ASSETS.liveWallpaper.slug, 3);
  const { webm, mp4, poster } = ASSETS.liveWallpaper;
  const hasVideo = Boolean(webm || mp4);
  const dynamic = {
    day: slot(ASSETS.dynamic.day, pick, 4, "Day"),
    sunset: slot(ASSETS.dynamic.sunset, pick, 5, "Sunset"),
    night: slot(ASSETS.dynamic.night, pick, 6, "Night"),
  };
  const series = ASSETS.exclusiveSeries.map((s, i) => ({ label: s.label, w: pick(s.slug, 7 + i) }));
  const customW = pick(ASSETS.customRequest, 11);
  const custom = { src: displayUrl(customW), alt: `${displayTitle(customW.title)} wallpaper`, blur: customW.blur_data_url };

  const features: (Feature & { demo: React.ReactNode; loop?: number })[] = [
    {
      id: "resolution",
      name: "4K, 6K, 8K",
      tier: <Tier />,
      title: <span className="whitespace-nowrap">{withResLabels("4K → 6K → 8K")}</span>,
      line: "Keep scrolling. It keeps its detail.",
      loop: 9.5,
      demo: <Resolution w={hero} />,
    },
    {
      id: "screens",
      name: "Every screen",
      tier: <Tier plus />,
      title: "Every screen",
      line: "The same scene, recut for each one.",
      loop: 7,
      demo: <Screens w={screens} />,
    },
    {
      id: "multi-monitor",
      name: "Multi-monitor",
      tier: <Tier plus />,
      title: "Multi-monitor",
      line: "One picture across three displays.",
      loop: 10,
      demo: <MultiMonitor w={panorama} />,
    },
    {
      id: "live",
      name: "Live wallpapers",
      tier: <Tier plus />,
      title: "Live",
      line: "It moves. Quietly.",
      demo: <Live w={liveStill} />,
    },
    {
      id: "dynamic",
      name: "Dynamic wallpapers",
      tier: <Tier plus />,
      title: "Dynamic",
      line: "Scroll through a day.",
      demo: <Dynamic {...dynamic} />,
    },
    {
      id: "series",
      name: "Exclusive series",
      tier: <Tier plus />,
      title: "Exclusive series",
      line: "Games · Cars · Anime · Movies.",
      loop: 8,
      demo: <Series cards={series} />,
    },
    {
      id: "requests",
      name: "Custom requests",
      tier: <Tier plus />,
      title: "Custom requests",
      line: "Ask for it. It lands in your library.",
      loop: 9.5,
      demo: <Request w={customW} />,
    },
  ];

  return (
    <section aria-label="What Premium adds" className="relative isolate bg-[#eef3fa]">
      <Journey
        thread={thread}
        live={{ webm, mp4, poster: poster ?? (hasVideo ? displayUrl(liveStill) : thread.src) }}
        dynamic={dynamic}
        series={series.map((s) => ({ label: s.label, src: displayUrl(s.w) }))}
        custom={custom}
        features={features.map(({ id, name, tier, title, line }) => ({ id, name, tier, title, line }))}
        request={REQUEST}
      />

      {/* Stacked: phones, and wide screens that asked for less motion. */}
      <div className="lg:motion-safe:hidden">
        <div className="relative flex min-h-[78svh] items-end overflow-hidden px-5 pt-24 pb-12 text-white sm:px-8">
          <Image
            src={thread.src}
            alt={thread.alt}
            fill
            sizes="100vw"
            placeholder={thread.blur ? "blur" : "empty"}
            blurDataURL={thread.blur ?? undefined}
            className="object-cover"
          />
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0)_30%,rgb(0_0_0/0.5))]" />
          <div className="relative">
            <span className="rounded-full bg-white/20 px-3 py-1 text-[12px] font-semibold ring-1 ring-white/40 backdrop-blur-md">Premium</span>
            <h2 className="mt-4 font-display text-[44px] leading-[0.98] font-bold tracking-[-0.04em] sm:text-[60px]">What Premium adds</h2>
            <p className="mt-3 text-[16px] text-white/85">More ways to make your screen yours.</p>
          </div>
        </div>
        <ol className="px-5 sm:px-8">
          {features.map((f, i) => (
            <li key={f.id} className="flex min-h-[80svh] flex-col justify-center py-12">
              <div className="flex items-center gap-2.5">
                <span className="text-[12px] font-semibold tracking-[0.08em] text-label-3 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                {f.tier}
              </div>
              <h3 className="mt-3 font-display text-[36px] leading-[1.02] font-bold tracking-[-0.034em] text-label sm:text-[46px]">{f.title}</h3>
              <p className="mt-2 text-[15px] text-label-2">{f.line}</p>
              <div className="mt-8">
                <InView loop={f.loop}>{f.demo}</InView>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
