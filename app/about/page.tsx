import type { Metadata } from "next";
import Image from "next/image";
import { PageBody } from "@/components/site/Section";
import { SiteHeader } from "@/components/site/SiteHeader";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About",
  description: "Wallpeace is a small library of original desktop wallpapers, made one at a time and tested on a real Mac desktop.",
  alternates: { canonical: "/about" },
};

const PROCESS = [
  {
    title: "Start with a place",
    body: "Every wallpaper begins as a mood: a quiet street after rain, a field at sunset, a temple in the trees.",
  },
  {
    title: "Build it in 4K",
    body: "Each scene is composed and refined until the small details hold up on a large, sharp display.",
  },
  {
    title: "Test it on a desktop",
    body: "A wallpaper lives behind the menu bar, the Dock and your windows, so every one is checked there before it's published. The 3D MacBook preview on this site is the same check.",
  },
  {
    title: "Publish the original",
    body: "Downloads are the full-resolution original, not a compressed copy.",
  },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <PageBody narrow>
        <Image
          src="/logo.webp"
          alt=""
          width={64}
          height={64}
          priority
          unoptimized
          className="drop-shadow-[0_2px_5px_rgb(0_0_0/0.18)]"
        />
        <h1 className="mt-6 font-display text-[28px] font-semibold tracking-[-0.02em] text-label">About Wallpeace</h1>

        <div className="mt-4 flex flex-col gap-4 text-[15px] leading-relaxed text-label-2">
          <p>
            Wallpeace is a small library of original desktop wallpapers. Every one is made here, one at a time, for the
            screen you look at all day.
          </p>
          <p>
            It started with a simple frustration: most wallpaper sites are endless feeds of the same images, buried under
            ads and upsells. Wallpeace goes the other way. A short list, carefully made, and easy to download in full
            quality.
          </p>
        </div>

        <h2 className="mt-14 font-display text-[22px] font-semibold tracking-[-0.015em] text-label">How each one is made</h2>
        <ol className="mt-5 flex flex-col gap-5">
          {PROCESS.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-fill-2 text-[12px] font-semibold text-label-2 tabular-nums">
                {i + 1}
              </span>
              <div>
                <h3 className="text-[15px] font-semibold text-label">{step.title}</h3>
                <p className="mt-0.5 text-[14px] leading-relaxed text-label-2">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-14 flex gap-2">
          <ButtonLink href="/browse" variant="primary" size="sm">
            Browse Wallpapers
          </ButtonLink>
          <ButtonLink href="/collections" variant="secondary" size="sm">
            Collections
          </ButtonLink>
        </div>
      </PageBody>
    </>
  );
}
