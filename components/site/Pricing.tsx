import { ButtonLink } from "@/components/ui/Button";
import { Check, StarFill, XMark } from "@/components/ui/icons";
import { ComingSoonBadge } from "./Premium";
import { Reveal } from "./Reveal";

type Feature = { text: string; lead?: boolean; off?: boolean };

type Tier = {
  id: string;
  name: string;
  price: string;
  priceNote: string;
  blurb: string;
  features: Feature[];
  /** The tier the page is selling: a little larger, lifted, outlined in the premium color. */
  accent?: boolean;
  star?: boolean;
  soon?: boolean;
  cta: { label: string; href: string } | null;
};

export const TIERS: Tier[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    priceNote: "Always",
    blurb: "The whole open library, in 4K, with nothing to sign up for.",
    features: [
      { text: "Curated 4K wallpapers" },
      { text: "Standard downloads" },
      { text: "3D MacBook preview" },
      { text: "New wallpapers regularly" },
      // Worded so the muted row can't be read as "no ads", which is the Premium line below.
      { text: "Ad-supported", off: true },
    ],
    cta: { label: "Browse Free Wallpapers", href: "/browse" },
  },
  {
    id: "premium",
    name: "Premium",
    price: "One-time",
    priceNote: "Lifetime access",
    blurb: "Every premium wallpaper, at the size your display deserves, paid for once.",
    accent: true,
    star: true,
    soon: true,
    features: [
      { text: "All premium & exclusive wallpapers" },
      { text: "Up to 6K downloads" },
      { text: "No ads" },
      { text: "Early access to new drops" },
      { text: "Premium collections" },
      { text: "Multiple sizes & aspect ratios" },
      { text: "Lifetime access — one-time purchase" },
    ],
    cta: null,
  },
  {
    id: "premium-plus",
    name: "Premium+",
    price: "One-time",
    priceNote: "Lifetime access & updates",
    blurb: "The full studio output: 8K masters, motion, monthly drops and commercial use.",
    star: true,
    soon: true,
    features: [
      { text: "Everything in Premium", lead: true },
      { text: "Up to 8K downloads" },
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
    cta: null,
  },
];

function FeatureRow({ feature }: { feature: Feature }) {
  const Icon = feature.off ? XMark : Check;
  return (
    <li className="flex gap-2">
      <Icon
        width={15}
        height={15}
        className={`mt-[2px] shrink-0 ${feature.off ? "text-label-3" : "text-accent"}`}
      />
      <span
        className={`text-[13px] leading-snug ${
          feature.off ? "text-label-3" : feature.lead ? "font-semibold text-label" : "text-label-2"
        }`}
      >
        {feature.text}
      </span>
    </li>
  );
}

function TierCard({ tier }: { tier: Tier }) {
  return (
    <div
      className={`flex h-full flex-col rounded-[14px] bg-surface p-6 transition-[box-shadow,translate] duration-300 ease-(--ease-mac) [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:shadow-card-hover ${
        tier.accent ? "shadow-card-hover ring-1 ring-premium/35" : "shadow-card"
      }`}
    >
      <div className="flex items-center gap-2">
        {tier.star && <StarFill width={16} height={16} className="text-premium" />}
        <h3 className="font-display text-[17px] font-semibold tracking-[-0.015em] text-label">{tier.name}</h3>
        {tier.soon && <ComingSoonBadge />}
      </div>

      <p className="mt-4 font-display text-[28px] font-semibold tracking-[-0.02em] text-label">{tier.price}</p>
      <p className="mt-0.5 text-[12px] text-label-3">{tier.priceNote}</p>

      <p className="mt-3 text-[13px] leading-relaxed text-label-2">{tier.blurb}</p>

      <ul className="mt-6 flex flex-col gap-2.5 border-t border-separator pt-6">
        {tier.features.map((f) => (
          <FeatureRow key={f.text} feature={f} />
        ))}
      </ul>

      {/* mt-auto: the three cards are the same height, so their buttons line up along the bottom. */}
      <div className="mt-auto pt-7">
        {tier.cta ? (
          <ButtonLink href={tier.cta.href} variant={tier.accent ? "primary" : "secondary"} size="sm">
            {tier.cta.label}
          </ButtonLink>
        ) : (
          // Nothing to buy yet: a label in the button's place, so the cards still line up.
          <span className="inline-flex h-7 select-none items-center rounded-[7px] bg-fill px-3 text-[13px] font-medium text-label-3">
            Coming Soon
          </span>
        )}
      </div>
    </div>
  );
}

/** The three tiers, side by side on desktop and stacked on phones. */
export function Pricing() {
  return (
    <section aria-labelledby="pricing-title" className="rounded-[14px] bg-grouped px-5 py-12 sm:px-8 lg:px-10">
      <Reveal className="text-center">
        <h2
          id="pricing-title"
          className="font-display text-[22px] font-semibold tracking-[-0.015em] text-label"
        >
          Pricing
        </h2>
        <p className="mx-auto mt-1 max-w-[48ch] text-[13px] leading-snug text-label-2">
          The free library stays free. Premium adds the work that takes longer to make.
        </p>
      </Reveal>

      <div className="mx-auto mt-9 grid max-w-[1080px] items-stretch gap-5 lg:grid-cols-3">
        {TIERS.map((t, i) => (
          <Reveal key={t.id} delay={i * 80} className="h-full">
            <TierCard tier={t} />
          </Reveal>
        ))}
      </div>

      <Reveal className="mx-auto mt-8 max-w-[52ch] text-center text-[12px] leading-relaxed text-label-3">
        <p>Premium and Premium+ aren&apos;t on sale yet. Prices are set before launch.</p>
      </Reveal>
    </section>
  );
}
