import type { Metadata } from "next";
import { PremiumFeatureShowcaseV2 } from "@/components/site/PremiumFeatureShowcaseV2";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getWallpapers } from "@/lib/wallpapers";

/** A private preview of the V2 premium showcase, for comparing against V1 on the home page. */
export const metadata: Metadata = {
  title: "Premium showcase — V2 preview",
  robots: { index: false, follow: false },
};

export default async function ShowcaseV2Page() {
  const wallpapers = await getWallpapers();
  return (
    <>
      <SiteHeader />
      <main>
        <PremiumFeatureShowcaseV2 wallpapers={wallpapers} />
        {/* Room after the last chapter, so the stage can be seen letting go. */}
        <div className="h-[50svh]" />
      </main>
    </>
  );
}
