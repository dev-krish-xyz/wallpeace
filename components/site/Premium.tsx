import { ButtonLink } from "@/components/ui/Button";
import { SpotlightCard } from "./SpotlightCard";
import {
  ArtDaylight,
  ArtDevices,
  ArtDisplays,
  ArtLibrary,
  ArtLive,
  ArtRequest,
  ArtResolution,
  ArtSeries,
} from "./FeatureArt";
import {
  Daylight,
  Devices,
  Displays,
  Library,
  Live,
  Request,
  Resolution,
  Series,
  StarFill,
} from "@/components/ui/icons";
import { ResLabel, withResLabels } from "@/components/ui/ResolutionBadge";

export const PREMIUM_POINTS = [
  {
    title: "Complete series",
    body: "Larger sets built around one world, made to work together across your desktops.",
  },
  {
    title: "Master files",
    body: "The highest-resolution masters, straight from the studio, for large and high-density displays.",
  },
  {
    title: "Early access",
    body: "New premium wallpapers before anywhere else, with more added over time.",
  },
];

/**
 * Everything the paid tiers add, in the order the premium page demonstrates them. `tier` is the
 * lowest tier that includes the feature, so a reader can tell the two apart at a glance.
 */
export const PREMIUM_FEATURES = [
  {
    title: "Up to 8K masters",
    span: "lg:col-span-2",
    from: "#ffc24b",
    to: "#ef8a12",
    art: ArtResolution,
    icon: Resolution,
    tier: "Premium+",
    body: "4K on the free library, 6K on Premium, and 8K masters with every detail intact on Premium+.",
  },
  {
    title: "Screen variations",
    from: "#7fc4ff",
    to: "#2f7fe0",
    art: ArtDevices,
    icon: Devices,
    tier: "Premium+",
    body: "The same scene recomposed for Mac, iPad and iPhone, not one crop stretched across all three.",
  },
  {
    title: "Multi-monitor packs",
    from: "#b4aefc",
    to: "#6f63e0",
    art: ArtDisplays,
    icon: Displays,
    tier: "Premium+",
    body: "One panorama cut across two or three displays, so it runs unbroken from edge to edge.",
  },
  {
    title: "Live wallpapers",
    from: "#86e0c5",
    to: "#17a68b",
    art: ArtLive,
    icon: Live,
    tier: "Premium+",
    body: "Clouds, water and light that keep moving on your desktop, on a loop with no visible cut.",
  },
  {
    title: "Dynamic day → night",
    from: "#ffb48a",
    to: "#ef6f8e",
    art: ArtDaylight,
    icon: Daylight,
    tier: "Premium+",
    body: "One landscape that follows your clock, from midday through golden hour into night.",
  },
  {
    title: "Exclusive series",
    span: "lg:col-span-2",
    from: "#f0a5d6",
    to: "#b45fd1",
    art: ArtSeries,
    icon: Series,
    tier: "Premium+",
    body: "Games, cars, anime and movies: full sets built around one world, members only.",
  },
  {
    title: "Custom requests",
    span: "lg:col-span-2",
    from: "#8fdcf2",
    to: "#2aa3c9",
    art: ArtRequest,
    icon: Request,
    tier: "Premium+",
    body: "Describe the wallpaper you want at the ratio you need, and it lands in your library.",
  },
  {
    title: "Complete library, no ads",
    span: "lg:col-span-2",
    from: "#ffdf9b",
    to: "#e0a63a",
    art: ArtLibrary,
    icon: Library,
    tier: "Premium",
    body: "Every premium and exclusive wallpaper, early access to new drops, and a quiet page.",
  },
];

export function PremiumPoints() {
  return (
    <ul className="grid gap-6 sm:grid-cols-3">
      {PREMIUM_POINTS.map((p) => (
        <li key={p.title}>
          <h3 className="text-[15px] font-semibold text-label">{p.title}</h3>
          <p className="mt-0.5 text-[13px] leading-relaxed text-label-2">{p.body}</p>
        </li>
      ))}
    </ul>
  );
}

/**
 * The feature bento. Tiles are not all the same size on purpose: the eye settles on the biggest
 * block first, so the features worth paying for get the width and the rest support them. Each tile
 * carries one idea — a mark, a short headline, a line of copy, and an illustration that takes most
 * of the space.
 */
export function PremiumFeatures() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {PREMIUM_FEATURES.map(({ icon: Icon, art: Art, span, ...f }) => {
        const wide = span === "lg:col-span-2";
        return (
          <SpotlightCard
            key={f.title}
            className={`group relative isolate flex min-h-[210px] flex-col justify-end overflow-hidden rounded-[20px] bg-white/[0.04] p-5 backdrop-blur-2xl transition-transform duration-300 ease-(--ease-mac) [@media(hover:hover)]:hover:-translate-y-1 ${span ?? ""} ${
              wide ? "lg:min-h-[260px] lg:p-7" : ""
            } [box-shadow:inset_0_0_0_1px_rgb(255_255_255/0.08),inset_0_1px_0_rgb(255_255_255/0.14),0_2px_4px_rgb(0_0_0/0.4),0_20px_44px_-28px_rgb(0_0_0/0.9)]`}
          >
            {/* The illustration owns the tile and the copy sits on top of it, so a card is a picture
             *  with a caption rather than a paragraph with decoration. */}
            <Art
              id={`art-${f.title.replace(/[^a-z]/gi, "")}`}
              from={f.from}
              to={f.to}
              className={`pointer-events-none absolute -z-10 opacity-40 transition-[opacity,transform] duration-500 ease-(--ease-mac) group-hover:opacity-60 [@media(hover:hover)]:group-hover:scale-[1.04] ${
                wide ? "-top-6 right-0 h-[88%] w-auto" : "-top-4 -right-6 h-[72%] w-auto"
              }`}
            />
            {/* Its colour, spread thin across the whole tile and gone by the bottom edge. */}
            <span
              aria-hidden
              style={{ backgroundImage: `linear-gradient(to bottom right, ${f.from}, ${f.to})` }}
              className="pointer-events-none absolute inset-0 -z-10 opacity-[0.13] [mask-image:radial-gradient(120%_110%_at_85%_0%,black,transparent_78%)]"
            />
            {/* Under the copy, so a headline never has to fight the illustration behind it. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-black/70 via-black/35 to-transparent"
            />
            {/* The light that follows the cursor, in the border and on the face. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[20px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(240px_circle_at_var(--x,50%)_var(--y,0%),rgb(255_255_255/0.1),transparent_65%)]"
            />

            <span
              style={{ backgroundImage: `linear-gradient(to bottom, ${f.from}, ${f.to})` }}
              className="mb-auto grid size-10 place-items-center rounded-[12px] ring-1 ring-black/25 [box-shadow:inset_0_1px_0_rgb(255_255_255/0.5),inset_0_-1px_1px_rgb(0_0_0/0.22),0_6px_14px_-6px_rgb(0_0_0/0.8)]"
            >
              <Icon width={20} height={20} className="text-white drop-shadow-[0_1px_1px_rgb(0_0_0/0.3)]" />
            </span>

            <h3
              className={`mt-5 flex items-baseline gap-2 font-semibold text-white ${
                wide ? "text-[19px] lg:text-[22px]" : "text-[16px]"
              }`}
            >
              {withResLabels(f.title, "dark")}
              <span className="text-[11px] font-medium text-white/35">{f.tier}</span>
            </h3>
            <p className={`mt-1.5 text-white/60 ${wide ? "max-w-[44ch] text-[14px]" : "text-[13px]"} leading-relaxed`}>
              {withResLabels(f.body, "dark")}
            </p>
          </SpotlightCard>
        );
      })}
    </ul>
  );
}

/**
 * The dark panel the premium features live on, shared by the home page and the premium page so the
 * two never drift. Near-black and neutral: the only colour in here is the premium amber, and it is
 * spent on one pill and the icon you are pointing at.
 */
export function PremiumPanel({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden rounded-[22px] bg-[#0a0a0b] px-6 py-14 ring-1 ring-white/[0.07] sm:px-10 sm:py-16">
      {/* Colour behind the glass. Without something to smear, a frosted card over flat black is
       *  just a grey rectangle — these blobs are what the cards' blur actually picks up. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <span className="absolute -top-24 -left-20 size-[460px] rounded-full bg-[#ff9f0a] opacity-[0.22] blur-[100px]" />
        <span className="absolute top-[18%] left-[38%] size-[420px] rounded-full bg-[#7c8cff] opacity-[0.13] blur-[110px]" />
        <span className="absolute -right-24 -bottom-20 size-[480px] rounded-full bg-[#4fb3d9] opacity-[0.15] blur-[110px]" />
        <span className="absolute right-[26%] bottom-[-10%] size-[340px] rounded-full bg-[#e07fc0] opacity-[0.1] blur-[100px]" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {children}
    </section>
  );
}

/** Home page section for the premium tiers: what they add, then what they cost. */
export function PremiumTeaser() {
  return (
    <PremiumPanel>
      <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold tracking-[0.06em] text-premium uppercase">
            <StarFill width={11} height={11} />
            Premium
          </span>
          <h2 className="mt-3 font-display text-[30px] font-semibold tracking-[-0.021em] text-white sm:text-[36px]">
            Everything the free library isn&apos;t
          </h2>
          <p className="mt-3 max-w-[56ch] text-[15px] leading-relaxed text-white/55 sm:text-[16px]">
            <ResLabel tone="dark">8K</ResLabel> masters, wallpapers that move, packs cut for every screen you own, and wallpapers made to
            order. From $5, paid once — and the free library never moves behind it.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <ButtonLink href="/premium" variant="primary" size="md">
            See Premium
          </ButtonLink>
          <ButtonLink
            href="/browse"
            size="md"
            className="bg-white/[0.06] text-white ring-1 ring-white/15 hover:bg-white/10"
          >
            Browse Free
          </ButtonLink>
        </div>
      </div>

      <div className="mt-10">
        <PremiumFeatures />
      </div>
    </PremiumPanel>
  );
}
