import type { Metadata } from "next";
import { ComingSoonBadge, PremiumPoints } from "@/components/site/Premium";
import { Pricing } from "@/components/site/Pricing";
import { PageBody } from "@/components/site/Section";
import { SiteHeader } from "@/components/site/SiteHeader";
import { ButtonLink } from "@/components/ui/Button";
import { StarFill } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Premium",
  description: "Wallpeace Premium is coming soon: complete series, master files and early access. The free library stays free.",
  alternates: { canonical: "/premium" },
};

const FAQ = [
  {
    q: "Will the free wallpapers stay free?",
    a: "Yes. Everything in the free library stays free to download. Premium is a separate set on top of it.",
  },
  {
    q: "How will premium wallpapers be delivered?",
    a: "Each premium wallpaper unlocks for your account, and you download the full master file from its page.",
  },
  {
    q: "What's the difference between Premium and Premium+?",
    a: "Premium is the full wallpaper library up to 6K. Premium+ adds 8K masters, live and dynamic wallpapers, multi-monitor packs, custom requests and a commercial-use license.",
  },
  {
    q: "When is it launching?",
    a: "Soon. This page is where you'll be able to unlock premium wallpapers once it's ready.",
  },
];

export default function PremiumPage() {
  return (
    <>
      <SiteHeader />
      <PageBody className="flex flex-col gap-16 lg:gap-20">
        {/* The prose keeps the narrow measure of the other pages; the pricing grid goes wide. */}
        <div className="max-w-[720px]">
          <ComingSoonBadge />
          <h1 className="mt-3 flex items-center gap-2.5 font-display text-[28px] font-semibold tracking-[-0.02em] text-label">
            <StarFill width={26} height={26} className="text-premium" />
            Wallpeace Premium
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-label-2">
            Premium is a members-only library of the most ambitious Wallpeace wallpapers: bigger scenes, complete series
            and the original master files. It&apos;s being built now and isn&apos;t available yet.
          </p>

          <div className="mt-12">
            <PremiumPoints />
          </div>
        </div>

        <Pricing />

        <div className="max-w-[720px]">
          <h2 className="font-display text-[22px] font-semibold tracking-[-0.015em] text-label">Questions</h2>
          <dl className="mt-5 flex flex-col gap-5">
            {FAQ.map((f) => (
              <div key={f.q}>
                <dt className="text-[15px] font-semibold text-label">{f.q}</dt>
                <dd className="mt-0.5 text-[14px] leading-relaxed text-label-2">{f.a}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-14">
            <ButtonLink href="/browse" variant="primary" size="sm">
              Browse Free Wallpapers
            </ButtonLink>
          </div>
        </div>
      </PageBody>
    </>
  );
}
