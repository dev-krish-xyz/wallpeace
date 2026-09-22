import { SiteHeader } from "@/components/site/SiteHeader";

/** Mirrors the studio's shape: preview on the right, rail on the left. */
export default function WallpaperLoading() {
  return (
    <>
      <SiteHeader />
      <div className="flex flex-col lg:grid lg:h-[calc(100dvh-52px)] lg:grid-cols-[40%_1fr]">
        <aside className="order-2 border-separator bg-grouped px-5 pt-1.5 pb-2 lg:order-1 lg:border-r lg:p-6">
          <div className="h-[46vw] animate-pulse rounded-[14px] bg-fill sm:h-[30vw] lg:h-full" />
        </aside>
        <section className="order-1 flex min-h-0 flex-col px-5 lg:order-2 lg:px-10">
          <div className="h-[clamp(232px,58vw,520px)] animate-pulse rounded-[14px] bg-fill sm:h-[clamp(280px,62vw,520px)] lg:my-10 lg:h-auto lg:flex-1" />
          <div className="mt-4 h-[22px] w-48 animate-pulse rounded-full bg-fill" />
          <div className="mt-2 mb-6 h-[13px] w-64 animate-pulse rounded-full bg-fill" />
        </section>
      </div>
    </>
  );
}
