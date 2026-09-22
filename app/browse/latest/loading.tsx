import { GridSkeleton, HeaderSkeleton } from "@/components/gallery/Skeleton";
import { PageBody } from "@/components/site/Section";
import { SiteHeader } from "@/components/site/SiteHeader";

export default function BrowseLatestLoading() {
  return (
    <>
      <SiteHeader />
      <PageBody>
        <HeaderSkeleton />
        <GridSkeleton count={8} />
      </PageBody>
    </>
  );
}
