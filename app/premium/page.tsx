import type { Metadata } from "next";
import type { QA } from "@/components/site/Faq";
import { Faq } from "@/components/site/Faq";
import { PremiumFeatures, PremiumPanel } from "@/components/site/Premium";
import { Pricing } from "@/components/site/Pricing";
import { PremiumShowcase } from "@/components/site/PremiumShowcase";
import { PageBody } from "@/components/site/Section";
import { SiteHeader } from "@/components/site/SiteHeader";
import { ButtonLink } from "@/components/ui/Button";
import { StarFill } from "@/components/ui/icons";
import { getWallpapers } from "@/lib/wallpapers";

export const metadata: Metadata = {
  title: "Premium",
  description: "Wallpeace Premium: complete series, 8K masters, live wallpapers and custom requests, from $5 once. The free library stays free.",
  alternates: { canonical: "/premium" },
};

const FAQ: QA[] = [
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
    q: "How much is it?",
    a: "Premium is $5 and Premium+ is $15, each paid once. There is no subscription and no renewal.",
  },
];

export default async function PremiumPage() {
  const wallpapers = await getWallpapers();

  return (
    <>
      <SiteHeader />
      <PageBody className="flex flex-col gap-16 lg:gap-20">
        {/* The prose keeps the narrow measure of the other pages; the pricing grid goes wide. */}
        <div className="max-w-[720px]">
          <h1 className=" flex items-center gap-2.5 font-display text-[36px] font-semibold tracking-[-0.024em] text-label sm:text-[44px]">
            <StarFill width={32} height={32} className="text-premium" />
            Wallpeace Premium
          </h1>
          <p className="mt-3 text-[16px] leading-relaxed text-label-2">
            Premium is a members-only library of the most ambitious Wallpeace wallpapers: bigger scenes, complete
            series and the original master files. $5 for Premium, $15 for Premium+, paid once.
          </p>

        </div>

        <PremiumPanel>
          <h2 className="font-display text-[30px] font-semibold tracking-[-0.021em] text-white sm:text-[36px]">
            What you get
          </h2>
          <p className="mt-3 max-w-[56ch] text-[15px] leading-relaxed text-white/60 sm:text-[16px]">
            Every feature below is included for life, on a single payment.
          </p>
          <div className="mt-10">
            <PremiumFeatures />
          </div>
        </PremiumPanel>

        <PremiumShowcase wallpapers={wallpapers} />

        <Pricing />

        <Faq items={FAQ} />

        <div className="flex justify-center">
          <ButtonLink href="/browse" variant="primary" size="md">
            Browse Free Wallpapers
          </ButtonLink>
        </div>
      </PageBody>
    </>
  );
}
