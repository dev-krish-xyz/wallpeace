import { ButtonLink } from "@/components/ui/Button";
import { Check, StarFill, XMark } from "@/components/ui/icons";
import { Reveal } from "./Reveal";

type Feature = { text: string; lead?: boolean; off?: boolean };

type Tier = {
  id: string;
  name: string;
  price: string;
  priceNote: string;
  blurb: string;
  /** Heading over the feature list, so each column says what it is adding to. */
  listTitle: string;
  features: Feature[];
  /** The tier the page is selling: lifted, outlined in the premium color, labelled. */
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
    cta: { label: "Get Premium+", href: "/premium" },
  },
];

function FeatureRow({ feature, paid }: { feature: Feature; paid?: boolean }) {
  const Icon = feature.off ? XMark : Check;
  return (
    <li className="flex gap-2.5">
      {/* The tick sits in its own disc, so a line that wraps still reads against a clean edge. */}
      <span
        className={`mt-px grid size-[18px] shrink-0 place-items-center rounded-full ${
          feature.off ? "bg-fill text-label-3" : paid ? "bg-premium/15 text-premium" : "bg-accent/12 text-accent"
        }`}
      >
        <Icon width={11} height={11} />
      </span>
      <span
        className={`text-[14px] leading-[1.45] ${
          feature.off ? "text-label-3" : feature.lead ? "font-semibold text-label" : "text-label-2"
        }`}
      >
        {feature.text}
      </span>
    </li>
  );
}

function TierCard({ tier }: { tier: Tier }) {
  const paid = Boolean(tier.star);
  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-[18px] bg-surface transition-[box-shadow,translate] duration-300 ease-(--ease-mac) [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:shadow-card-hover ${
        tier.accent ? "shadow-card-hover ring-1 ring-premium/45" : "shadow-card ring-1 ring-black/[0.04]"
      }`}
    >
      {/* A warm wash down the top of the paid cards, and nothing at all on the free one. */}
      {paid && (
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 top-0 h-[140px] bg-gradient-to-b to-transparent ${
            tier.accent ? "from-premium/12" : "from-premium/[0.06]"
          }`}
        />
      )}

      <div className="relative p-7">
        <div className="flex items-center gap-2">
          {tier.star && <StarFill width={16} height={16} className="text-premium" />}
          <h3 className="font-display text-[19px] font-semibold tracking-[-0.015em] text-label">{tier.name}</h3>
          {tier.badge && (
            <span
              className={`ml-auto inline-flex h-[21px] items-center rounded-full px-2.5 text-[11px] font-semibold ${
                tier.accent ? "bg-premium text-white" : "bg-premium/15 text-premium"
              }`}
            >
              {tier.badge}
            </span>
          )}
        </div>

        <p className="mt-5 font-display text-[40px] leading-none font-semibold tracking-[-0.025em] text-label">
          {tier.price}
        </p>
        <p className="mt-2 text-[12px] font-medium text-label-3">{tier.priceNote}</p>

        {/* A floor under the blurb, so the three buttons line up across the row on desktop. */}
        <p className="mt-4 min-h-[40px] text-[14px] leading-relaxed text-label-2">{tier.blurb}</p>

        {/* The call to action sits above the list: the decision is the price, not the sixth bullet. */}
        <div className="mt-6">
          <ButtonLink
            href={tier.cta.href}
            variant={tier.accent ? "primary" : "secondary"}
            size="md"
            className="w-full"
          >
            {tier.cta.label}
          </ButtonLink>
        </div>
      </div>

      <div className="relative border-t border-separator px-7 pt-6 pb-8">
        <p className="text-[11px] font-semibold tracking-[0.04em] text-label-3 uppercase">{tier.listTitle}</p>
        <ul className="mt-4 flex flex-col gap-3">
          {tier.features.map((f) => (
            <FeatureRow key={f.text} feature={f} paid={paid} />
          ))}
        </ul>
      </div>
    </div>
  );
}

/** The three tiers, side by side on desktop and stacked on phones. */
export function Pricing() {
  return (
    <section aria-labelledby="pricing-title" className="rounded-[14px] bg-grouped px-5 py-14 sm:px-8 lg:px-10">
      <Reveal className="text-center">
        <p className="text-[13px] font-semibold text-premium">Plans</p>
        <h2
          id="pricing-title"
          className="mt-1 font-display text-[30px] font-semibold tracking-[-0.021em] text-label sm:text-[36px]"
        >
          One payment, or nothing at all
        </h2>
        <p className="mx-auto mt-2 max-w-[52ch] text-[14px] leading-snug text-label-2 sm:text-[15px]">
          The free library stays free. Premium adds the work that takes longer to make — $5 or $15, paid once,
          never a subscription.
        </p>
      </Reveal>

      {/* items-start rather than stretch: the paid columns carry more lines, and forcing the free
       *  card to match their height would leave it standing mostly empty. */}
      <div className="mx-auto mt-10 grid max-w-[1120px] items-start gap-5 lg:grid-cols-3">
        {TIERS.map((t, i) => (
          <Reveal key={t.id} delay={i * 80}>
            <TierCard tier={t} />
          </Reveal>
        ))}
      </div>

      <Reveal className="mx-auto mt-9 flex max-w-[64ch] flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[12px] text-label-3">
        <span>Pay once, keep it for good</span>
        <span aria-hidden>·</span>
        <span>One-time payment, no subscription</span>
        <span aria-hidden>·</span>
        <span>The free library never goes behind it</span>
      </Reveal>
    </section>
  );
}
