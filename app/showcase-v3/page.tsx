import type { Metadata } from "next";
import { PremiumFeatureShowcaseV3 } from "@/components/site/PremiumFeatureShowcaseV3";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getWallpapers } from "@/lib/wallpapers";

/** A private preview of the V3 premium showcase, for comparing against V1 and V2. */
export const metadata: Metadata = {
  title: "Premium showcase — V3 preview",
  robots: { index: false, follow: false },
};

export default async function ShowcaseV3Page() {
  const wallpapers = await getWallpapers();
  return (
    <>
      <SiteHeader />
      <main>
        <PremiumFeatureShowcaseV3 wallpapers={wallpapers} />
        {/* Room after the last chapter, so the stage can be seen letting go. */}
        <div className="h-[50svh]" />
      </main>
    </>
  );
}
