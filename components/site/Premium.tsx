import { ButtonLink } from "@/components/ui/Button";
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
    icon: Resolution,
    tier: "Premium+",
    body: "4K on the free library, 6K on Premium, and 8K masters with every detail intact on Premium+.",
  },
  {
    title: "Screen variations",
    icon: Devices,
    tier: "Premium+",
    body: "The same scene recomposed for Mac, iPad and iPhone, not one crop stretched across all three.",
  },
  {
    title: "Multi-monitor packs",
    icon: Displays,
    tier: "Premium+",
    body: "One panorama cut across two or three displays, so it runs unbroken from edge to edge.",
  },
  {
    title: "Live wallpapers",
    icon: Live,
    tier: "Premium+",
    body: "Clouds, water and light that keep moving on your desktop, on a loop with no visible cut.",
  },
  {
    title: "Dynamic day → night",
    icon: Daylight,
    tier: "Premium+",
    body: "One landscape that follows your clock, from midday through golden hour into night.",
  },
  {
    title: "Exclusive series",
    icon: Series,
    tier: "Premium+",
    body: "Games, cars, anime and movies: full sets built around one world, members only.",
  },
  {
    title: "Custom requests",
    icon: Request,
    tier: "Premium+",
    body: "Describe the wallpaper you want at the ratio you need, and it lands in your library.",
  },
  {
    title: "Complete library, no ads",
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

/** Every paid feature as its own card: a glyph, the name, the tier that unlocks it, and why. */
export function PremiumFeatures() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {PREMIUM_FEATURES.map(({ icon: Icon, ...f }) => (
        <li
          key={f.title}
          className="rounded-[14px] bg-surface p-5 shadow-card ring-1 ring-black/[0.04] transition-[box-shadow,translate] duration-300 ease-(--ease-mac) [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:shadow-card-hover"
        >
          <span className="grid size-9 place-items-center rounded-[10px] bg-premium/12 text-premium">
            <Icon width={19} height={19} />
          </span>
          <div className="mt-3.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-[16px] font-semibold text-label">{f.title}</h3>
            <span className="inline-flex h-[18px] items-center rounded-full bg-premium/12 px-1.5 text-[10px] font-semibold tracking-[0.01em] text-premium">
              {f.tier}
            </span>
          </div>
          <p className="mt-1.5 text-[14px] leading-relaxed text-label-2">{f.body}</p>
        </li>
      ))}
    </ul>
  );
}

/** Home page section for the premium tiers: what they add, then what they cost. */
export function PremiumTeaser() {
  return (
    // The one warm surface on an otherwise grey page: a faint amber wash over the grouped
    // background, hairlined in the same colour, so the block reads as the premium one before a
    // word of it is read.
    <section className="relative isolate overflow-hidden rounded-[18px] bg-grouped px-6 py-12 ring-1 ring-premium/15 sm:px-10 sm:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(90%_120%_at_0%_0%,rgb(255_159_10/0.10),transparent_58%),radial-gradient(70%_100%_at_100%_0%,rgb(0_122_255/0.06),transparent_60%)]"
      />

      {/* The heading and the way in sit on one line on desktop, so the block opens with a decision
       *  rather than a paragraph. */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-premium/14 px-2.5 py-1 text-[12px] font-semibold text-premium">
            <StarFill width={12} height={12} />
            Premium
          </span>
          <h2 className="mt-3.5 font-display text-[30px] font-semibold tracking-[-0.021em] text-label sm:text-[36px]">
            Everything the free library isn&apos;t
          </h2>
          <p className="mt-2.5 max-w-[56ch] text-[15px] leading-relaxed text-label-2 sm:text-[16px]">
            8K masters, wallpapers that move, packs cut for every screen you own, and wallpapers made to
            order. From $5, paid once — and the free library never moves behind it.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <ButtonLink href="/premium" variant="primary" size="md">
            See Premium
          </ButtonLink>
          <ButtonLink href="/browse" variant="secondary" size="md">
            Browse Free
          </ButtonLink>
        </div>
      </div>

      <div className="mt-9">
        <PremiumFeatures />
      </div>
    </section>
  );
}
