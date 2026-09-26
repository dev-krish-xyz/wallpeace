import Image from "next/image";
import Link from "next/link";
import pricingBg from "@/public/pricing-bg.webp";
import { ArrowRight, ArrowUpRight, Check, StarFill, XMark } from "@/components/ui/icons";
import { Reveal } from "./Reveal";
import { withResLabels } from "@/components/ui/ResolutionBadge";

type Feature = { text: string; lead?: boolean; off?: boolean };

/** The one or two figures a reader can take in without reading the list at all. */
type Stat = { value: string; label: string };

type Tier = {
  id: string;
  name: string;
  price: string;
  priceNote: string;
  blurb: string;
  /** Heading over the feature list, so each column says what it is adding to. */
  listTitle: string;
  features: Feature[];
  stats: [Stat, Stat];
  /** The tier the page is selling: lifted, outlined, labelled. */
  accent?: boolean;
  badge?: string;
  star?: boolean;
  cta: { label: string; href: string };
};

export const TIERS: Tier[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    priceNote: "Always free",
    blurb: "The whole open library, in 4K, with nothing to sign up for.",
    listTitle: "What you get",
    features: [
      { text: "Curated 4K wallpapers" },
      { text: "Standard downloads" },
      { text: "3D MacBook preview" },
      { text: "New wallpapers regularly" },
      // Worded so the muted row can't be read as "no ads", which is the Premium line below.
      { text: "Ad-supported", off: true },
    ],
    stats: [
      { value: "4K", label: "Max resolution" },
      { value: "0", label: "To pay, ever" },
    ],
    cta: { label: "Browse Free Wallpapers", href: "/browse" },
  },
  {
    id: "premium",
    name: "Premium",
    price: "$5",
    priceNote: "One-time · lifetime access",
    blurb: "Every premium wallpaper, at the size your display deserves, paid for once.",
    listTitle: "Everything in Free, plus",
    accent: true,
    badge: "Most popular",
    star: true,
    features: [
      { text: "All premium & exclusive wallpapers" },
      { text: "Up to 6K downloads" },
      { text: "No ads" },
      { text: "Early access to new drops" },
      { text: "Premium collections" },
      { text: "Multiple sizes & aspect ratios" },
      { text: "Lifetime access — one-time purchase" },
    ],
    stats: [
      { value: "6K", label: "Max resolution" },
      { value: "1", label: "Payment, ever" },
    ],
    cta: { label: "Get Premium", href: "/premium" },
  },
  {
    id: "premium-plus",
    name: "Premium+",
    price: "$15",
    priceNote: "One-time · lifetime access & updates",
    blurb: "The full studio output: 8K masters, motion, monthly drops and commercial use.",
    listTitle: "Everything in Premium, plus",
    badge: "Everything",
    star: true,
    features: [
      { text: "Up to 8K downloads", lead: true },
      { text: "Screen-specific variations" },
      { text: "Multi-monitor packs" },
      { text: "Live & animated wallpapers" },
      { text: "Dynamic day/night wallpapers" },
      { text: "Exclusive series: games, cars, anime, movies & more" },
      { text: "Exclusive monthly drops" },
      { text: "Custom wallpaper requests" },
      { text: "Commercial-use license" },
      { text: "Lifetime updates" },
    ],
    stats: [
      { value: "8K", label: "Max resolution" },
      { value: "1", label: "Payment, ever" },
    ],
    cta: { label: "Get Premium+", href: "/premium" },
  },
];

/** The rounded black / white pair the hero style leads with. */
function PillLink({
  href,
  children,
  tone = "light",
}: {
  href: string;
  children: React.ReactNode;
  tone?: "dark" | "light";
}) {
  return (
    <Link
      href={href}
      className={`inline-flex h-11 select-none items-center gap-2 rounded-full px-6 text-[15px] font-medium transition-[filter,background-color,translate] duration-200 ease-(--ease-mac) [@media(hover:hover)]:hover:-translate-y-px ${
        tone === "dark"
          ? "bg-[#0b0b0d] text-white shadow-[0_10px_30px_-12px_rgb(0_0_0/0.6)] hover:brightness-125"
          : "bg-white text-label shadow-[0_10px_30px_-14px_rgb(10_40_90/0.55)] hover:bg-white/90"
      }`}
    >
      {children}
      <ArrowRight width={16} height={16} />
    </Link>
  );
}

function FeatureRow({ feature, paid }: { feature: Feature; paid?: boolean }) {
  const Icon = feature.off ? XMark : Check;
  return (
    <li className="flex gap-2.5">
      {/* The tick sits in its own disc, so a line that wraps still reads against a clean edge. */}
      <span
        className={`mt-[1.5px] grid size-[17px] shrink-0 place-items-center rounded-full ${
          feature.off
            ? "bg-black/[0.07] text-label/45"
            : paid
              ? "bg-premium text-white shadow-[0_1px_2px_rgb(180_100_0/0.45)]"
              : "bg-accent text-white shadow-[0_1px_2px_rgb(0_60_160/0.4)]"
        }`}
      >
        <Icon width={11} height={11} strokeWidth={2.6} />
      </span>
      <span
        className={`text-[12.5px] leading-[1.38] ${
          feature.off ? "text-label/40" : feature.lead ? "font-semibold text-label" : "text-label/80"
        }`}
      >
        {withResLabels(feature.text)}
      </span>
    </li>
  );
}

/**
 * A cloud, drawn rather than photographed: overlapping lumps on a flat base, softened enough that
 * the circles it is made of never read as circles. Two of these sit in the upper corners.
 */
function Cloud({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 140" fill="none" aria-hidden className={className}>
      <g fill="#fff">
        <ellipse cx="96" cy="86" rx="70" ry="42" />
        <ellipse cx="164" cy="66" rx="58" ry="48" />
        <ellipse cx="216" cy="88" rx="52" ry="36" />
        <ellipse cx="132" cy="58" rx="40" ry="32" />
        <rect x="30" y="86" width="250" height="42" rx="21" />
      </g>
    </svg>
  );
}

/** One frosted card floating over the photograph, whole surface clickable. */
function TierCard({ tier }: { tier: Tier }) {
  const paid = Boolean(tier.star);
  return (
    // Two panes, not one: a wide band of clear glass holding a frosted card inside it. The band is
    // what you see round the edge of the reference — the card does not end at its own border, it
    // ends a few millimetres further out, in something you can see the sky through.
    <div
      className={`group relative isolate flex h-full flex-col rounded-[28px] p-[9px] backdrop-blur-md transition-[box-shadow,translate] duration-300 ease-(--ease-mac) [@media(hover:hover)]:hover:-translate-y-1 ${
        tier.accent
          ? "bg-white/25 [box-shadow:inset_0_0_0_1px_rgb(255_255_255/0.6),inset_0_1px_0_rgb(255_255_255/0.85),0_34px_70px_-26px_rgb(12_38_90/0.55)]"
          : tier.id === "premium-plus"
            ? "bg-white/[0.22] [box-shadow:inset_0_0_0_1px_rgb(255_255_255/0.6),inset_0_1px_0_rgb(255_255_255/0.85),0_26px_58px_-28px_rgb(12_38_90/0.5)]"
            : "bg-white/[0.18] [box-shadow:inset_0_0_0_1px_rgb(255_255_255/0.45),inset_0_1px_0_rgb(255_255_255/0.7),0_24px_54px_-28px_rgb(12_38_90/0.5)]"
      }`}
    >
      <div
        className={`relative isolate flex h-full flex-col overflow-hidden rounded-[20px] bg-white/[0.72] backdrop-blur-3xl backdrop-saturate-[1.15] ${
          tier.accent
            ? "[box-shadow:inset_0_0_0_1.25px_rgb(255_255_255/0.95),inset_0_1.5px_0_rgb(255_255_255/1),inset_0_-1px_0_rgb(255_255_255/0.65),inset_0_0_10px_rgb(255_255_255/0.6)]"
            : "[box-shadow:inset_0_0_0_1.25px_rgb(255_255_255/0.8),inset_0_1.5px_0_rgb(255_255_255/0.95),inset_0_-1px_0_rgb(255_255_255/0.5),inset_0_0_10px_rgb(255_255_255/0.45)]"
        }`}
      >
      {/* Premium+ gets one corner of light, in the amber the section already uses for premium.
       *  It comes in from the top right and is gone by two thirds, so the card stays the same
       *  glass as the other two rather than becoming a different colour. */}
      {tier.id === "premium-plus" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 rounded-[20px] bg-[radial-gradient(120%_95%_at_100%_0%,rgb(255_179_64/0.22),rgb(255_205_120/0.09)_38%,transparent_68%)]"
        />
      )}

      {/* Light catching the top edge of the glass, warmer on the tier being sold. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 -z-10 h-36 bg-gradient-to-b to-transparent ${
          tier.accent ? "from-white/80" : "from-white/55"
        }`}
      />

      <div className="px-6 pt-6 pb-5">
        <div className="flex items-start gap-2">
          {tier.star && <StarFill width={17} height={17} className="mt-1 text-premium" />}
          <h3 className="font-display text-[23px] leading-tight font-bold tracking-[-0.025em] text-label">{tier.name}</h3>
          {/* The circle arrow is the card's affordance: its ::after makes the whole card the target. */}
          <Link
            href={tier.cta.href}
            aria-label={tier.cta.label}
            className={`ml-auto grid size-9 shrink-0 place-items-center rounded-full ring-1 transition-[background-color,color,translate] duration-200 ease-(--ease-mac) after:absolute after:inset-0 after:content-[''] [@media(hover:hover)]:group-hover:-translate-y-px ${
              tier.accent
                ? "bg-[#0b0b0d] text-white ring-transparent hover:brightness-150"
                : "bg-white/80 text-label ring-black/[0.06] hover:bg-white"
            }`}
          >
            <ArrowUpRight width={16} height={16} />
          </Link>
        </div>

        <p className="mt-5 font-display text-[36px] leading-none font-semibold tracking-[-0.03em] text-label">
          {tier.price}
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {tier.badge && (
            <span
              className={`inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-semibold ${
                tier.accent ? "bg-premium text-white" : "bg-premium/15 text-premium ring-1 ring-premium/25"
              }`}
            >
              {tier.badge}
            </span>
          )}
          <span className="text-[12px] font-medium text-label/60">{tier.priceNote}</span>
        </div>

        {/* A floor under the blurb, so the three lists start on the same line on desktop. */}
        <p className="mt-2.5 min-h-[34px] text-[13px] leading-snug text-label/75">{withResLabels(tier.blurb)}</p>
      </div>

      <div className="flex flex-1 flex-col border-t border-white/55 px-6 pt-5 pb-5">
        <p className="text-[11px] font-semibold tracking-[0.05em] text-label/55 uppercase">{tier.listTitle}</p>
        <ul className="mt-3 flex flex-col gap-1.5">
          {tier.features.map((f) => (
            <FeatureRow key={f.text} feature={f} paid={paid} />
          ))}
        </ul>
      </div>

      {/* The two figures sit in a band at the foot of every card, so they line up across the row. */}
      <div className="grid grid-cols-2 gap-4 border-t border-white/65 bg-white/45 px-6 py-4">
        {tier.stats.map((s) => (
          <div key={s.label}>
            {/* The chip carries its own leading; pinned back to the line so a "4K" column and a
             *  "1" column stay the same height and the captions under them line up. */}
            <p className="font-display text-[22px] leading-none font-semibold tracking-[-0.02em] text-label [&_span]:leading-none">
              {withResLabels(s.value)}
            </p>
            <p className="mt-1 text-[11.5px] font-medium text-label/60">{s.label}</p>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}

/** The three tiers, side by side on desktop and stacked on phones. */
export function Pricing() {
  return (
    <section
      aria-labelledby="pricing-title"
      className="relative isolate overflow-hidden rounded-[22px] px-5 py-12 sm:px-8 sm:py-14 lg:px-10"
    >
      <Image
        src={pricingBg}
        alt=""
        fill
        sizes="(min-width: 1440px) 1376px, 100vw"
        placeholder="blur"
        className="-z-20 object-cover"
      />
      {/* Deepen the sky rather than milk it out: white type has to hold across the whole block. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(34_124_222/0.74),rgb(74_158_236/0.44)_45%,rgb(34_124_222/0.6))]"
      />

      {/* Weather in the two upper corners only, half out of frame, so the middle of the sky stays
       *  clear for the headline. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <Cloud className="absolute -top-2 -left-8 w-[17%] opacity-60 blur-[5px]" />
        <Cloud className="absolute top-[7%] left-[8%] w-[11%] opacity-40 blur-[6px]" />
        <Cloud className="absolute top-[2%] left-[17%] w-[8%] opacity-28 blur-[6px]" />
        <Cloud className="absolute -top-3 -right-6 w-[18%] scale-x-[-1] opacity-60 blur-[5px]" />
        <Cloud className="absolute top-[8%] right-[9%] w-[12%] scale-x-[-1] opacity-38 blur-[6px]" />
        <Cloud className="absolute top-[3%] right-[19%] w-[8%] opacity-26 blur-[7px]" />
      </div>

      <Reveal className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-[12.5px] font-medium text-white ring-1 ring-white/35 backdrop-blur-md">
          <StarFill width={12} height={12} />
          Pay once, yours for good
        </span>

        <h2
          id="pricing-title"
          className="mx-auto mt-5 max-w-[20ch] font-display text-[40px] leading-[0.98] font-bold tracking-[-0.04em] text-white sm:text-[54px] lg:text-[64px]"
        >
          The best your desktop has ever looked starts here
        </h2>

        <p className="mx-auto mt-5 max-w-[48ch] text-[16px] leading-snug text-white/85 sm:text-[19px]">
          A simpler way to find wallpapers worth keeping, download them at the size your display deserves, and pay
          for them once.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <PillLink href="/premium" tone="dark">
            Get Premium
          </PillLink>
          <PillLink href="/browse">Browse Free Library</PillLink>
        </div>
      </Reveal>

      {/* Every column the same height, so the three cards read as one object rather than a stagger. */}
      <div className="mx-auto mt-9 grid max-w-[1120px] items-stretch gap-4 lg:mt-10 lg:grid-cols-3">
        {TIERS.map((t, i) => (
          <Reveal key={t.id} delay={i * 80} className="h-full">
            <TierCard tier={t} />
          </Reveal>
        ))}
      </div>

      <Reveal className="mx-auto mt-8 flex max-w-[64ch] flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[12.5px] text-white/75 lg:mt-9">
        <span>Pay once, keep it for good</span>
        <span aria-hidden>·</span>
        <span>One-time payment, no subscription</span>
        <span aria-hidden>·</span>
        <span>The free library never goes behind it</span>
      </Reveal>
    </section>
  );
}
