import { StarFill } from "@/components/ui/icons";
import { withResLabels } from "@/components/ui/ResolutionBadge";
import { premiumDemoAssets as ASSETS } from "@/lib/premium-demo-assets";
import { displayUrl } from "@/lib/storage";
import type { Wallpaper } from "@/types/database";
import { type Chapter, Chapters } from "./Chapters";
import { Dynamic, library, Live, MultiMonitor, Request, Resolution, Screens, Series, slot, Tier } from "./demos";

/**
 * V2 of "What Premium adds": seven full-screen chapters on one canvas instead of a list beside a
 * card. Kept apart from `PremiumShowcase` (V1) so the two can be compared on the page and one of
 * them chosen; it shares the devices, keyframes, `DemoPlayer`, `LiveVideo` and the asset config.
 *
 * Meant to run edge to edge: give it the full width of the page, not a padded column.
 */
/** Two more library wallpapers for the series deck, beside the four in the asset config. */
const DECK_EXTRAS = [
  { label: "Anime", slug: "japanese-street-at-dusk-4k" },
  { label: "Games", slug: "giant-tree-island-4k" },
];

export function PremiumFeatureShowcaseV2({ wallpapers }: { wallpapers: Wallpaper[] }) {
  if (!wallpapers.length) return null;
  const pick = library(wallpapers);

  const resolution = pick(ASSETS.resolution, 0);
  const screens = pick(ASSETS.screens, 1);
  const panorama = pick(ASSETS.multiMonitor, 2);
  const live = pick(ASSETS.liveWallpaper.slug, 3);
  const day = slot(ASSETS.dynamic.day, pick, 4, "Day");
  const series = ASSETS.exclusiveSeries.map((s, i) => ({ label: s.label, w: pick(s.slug, 7 + i) }));
  // The coverflow shows five cards at once from a deck of six; two more from the library fill it
  // out, so no wallpaper is ever beside itself.
  const deck = [...series, ...DECK_EXTRAS.map((d, i) => ({ label: d.label, w: pick(d.slug, 12 + i) }))];
  const custom = pick(ASSETS.customRequest, 11);

  const chapters: Chapter[] = [
    {
      id: "resolution",
      name: "4K, 6K, 8K",
      tier: <Tier />,
      title: "Higher resolution",
      subtitle: <span className="whitespace-nowrap">{withResLabels("4K → 6K → 8K")}</span>,
      line: "The closer you look, the more there is.",
      loop: 9.5,
      ratio: 0.66,
      ambient: displayUrl(resolution),
      demo: <Resolution w={resolution} />,
    },
    {
      id: "screens",
      name: "Every screen",
      tier: <Tier plus />,
      title: "Every screen",
      line: "Recut for MacBook, iPad and iPhone — never stretched.",
      loop: 5.5,
      ratio: 0.46,
      ambient: displayUrl(screens),
      demo: <Screens w={screens} />,
    },
    {
      id: "multi-monitor",
      name: "Multi-monitor",
      tier: <Tier plus />,
      title: "Multi-monitor",
      line: "One picture, three displays, no seam in the wrong place.",
      loop: 7.5,
      ratio: 0.3,
      grow: 1.08,
      ambient: displayUrl(panorama),
      demo: <MultiMonitor w={panorama} />,
    },
    {
      id: "live",
      name: "Live wallpapers",
      tier: <Tier plus />,
      title: "Live wallpapers",
      line: "Slow motion behind your icons. Alive, never loud.",
      ratio: 0.66,
      ambient: displayUrl(live),
      demo: <Live w={live} />,
    },
    {
      id: "dynamic",
      name: "Dynamic wallpapers",
      tier: <Tier plus />,
      title: "Dynamic wallpapers",
      line: "Day, sunset, night — it follows your clock.",
      ratio: 0.72,
      ambient: day.src,
      demo: <Dynamic day={day} sunset={slot(ASSETS.dynamic.sunset, pick, 5, "Sunset")} night={slot(ASSETS.dynamic.night, pick, 6, "Night")} />,
    },
    {
      id: "series",
      name: "Exclusive series",
      tier: <Tier plus />,
      title: "Exclusive series",
      line: "Games · Cars · Anime · Movies. A new drop every month.",
      ratio: 0.62,
      ambient: displayUrl(series[3]?.w ?? resolution),
      demo: <Series cards={deck} />,
    },
    {
      id: "requests",
      name: "Custom requests",
      tier: <Tier plus />,
      title: "Custom requests",
      line: "Describe it. It gets made. It lands in your library.",
      loop: 8,
      ratio: 0.76,
      ambient: displayUrl(custom),
      demo: <Request w={custom} />,
    },
  ];

  return (
    <section aria-labelledby="showcase-v2-title" className="relative isolate bg-[linear-gradient(180deg,#f4f8fd_85%,#fff)]">
      <header className="relative z-10 mx-auto flex max-w-[60rem] flex-col items-center px-5 pt-12 pb-4 text-center sm:px-6 sm:pt-14 sm:pb-6 lg:pt-20 lg:pb-4">
        {/* A warm light behind the title, so the section opens on something rather than on white. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[-20%] inset-y-[-10%] -z-10 [mask-image:radial-gradient(closest-side,black_55%,transparent)] bg-[radial-gradient(46%_52%_at_50%_52%,rgb(255_196_120/0.32),transparent_70%),radial-gradient(60%_70%_at_28%_40%,rgb(170_200_250/0.45),transparent_70%),radial-gradient(56%_64%_at_74%_46%,rgb(140_190_255/0.42),transparent_70%)]"
        />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[12px] font-semibold text-premium shadow-[0_4px_16px_-6px_rgb(245_158_11/0.45)] ring-1 ring-white/90">
          <StarFill width={10} height={10} />
          Premium
        </span>
        <h2
          id="showcase-v2-title"
          className="mt-5 font-display text-[40px] leading-[1] font-bold tracking-[-0.04em] text-label sm:mt-6 sm:text-[72px] sm:leading-[0.98] lg:text-[96px]"
        >
          What{" "}
          <span className="relative isolate inline-block">
            {/* A soft blue marker stroke under the lower half of the word, laid on at a slight tilt. */}
            <span
              aria-hidden
              className="absolute inset-x-[-3%] bottom-[8%] -z-10 h-[34%] -rotate-[1.5deg] rounded-[0.18em] bg-[linear-gradient(90deg,rgb(96_165_250/0.22),rgb(59_130_246/0.34)_50%,rgb(96_165_250/0.22))]"
            />
            {/* Sunlight in the letters: gold at the top, deepening to orange. */}
            <span className="bg-[linear-gradient(180deg,#fcc419_8%,#f59f00_52%,#f76707_96%)] bg-clip-text text-transparent">Premium</span>
          </span>{" "}
          adds
        </h2>
        <p className="mt-3 text-[15px] text-label-2 sm:mt-5 sm:text-[19px]">More ways to make your screen yours.</p>
      </header>

      {/* On wide screens the stage starts under the title rather than a screen below it: its first
       *  chapter sits mid-stage, so without this pull the section opened on half a screen of sky. */}
      <div className="-mt-[3svh] lg:-mt-[9svh]">
        <Chapters chapters={chapters} />
      </div>
    </section>
  );
}
