import Image from "next/image";
import banner from "@/public/brand-banner.webp";
import { Reveal } from "./Reveal";

/**
 * The band between the studio and the library: the mark, the name, and what the place is for, over
 * one of the studio's own skies. The picture is imported rather than referenced by path, so Next
 * knows its size and generates the blur that stands in while it loads.
 */
export function BrandBanner() {
  return (
    // Pulls the row below closer than the page's standard gap: the band is a divider between the
    // studio and the library, and it belongs with the library rather than halfway between them.
    <Reveal className="-mb-7 lg:-mb-9">
      <section
        aria-label="Wallpeace"
        className="relative isolate overflow-hidden rounded-[14px] px-6 py-[15px] text-center sm:py-[31px]"
      >
        <Image
          src={banner}
          alt=""
          fill
          sizes="(min-width: 1440px) 1376px, 100vw"
          placeholder="blur"
          priority
          // The file is already a webp the studio tuned; the optimizer's default would re-encode
          // that lossy picture a second time and take the sky's gradients with it.
          quality={95}
          // Cut to the band's own proportions, so it needs no reframing — cover only absorbs the
          // few pixels of difference at other widths.
          className="-z-10 object-cover"
        />
        {/* Light behind the words, so they read over whichever part of the sky the crop lands on. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(46% 78% at 50% 50%, rgb(255 255 255 / 0.72), rgb(255 255 255 / 0.28) 62%, transparent 82%)",
          }}
        />

        <div className="flex items-center justify-center gap-2.5 sm:gap-3.5">
          <Image
            src="/logo.webp"
            alt=""
            width={52}
            height={52}
            unoptimized
            className="size-[38px] drop-shadow-[0_1px_3px_rgb(0_0_0/0.22)] sm:size-[52px]"
          />
          <p className="font-display text-[30px] font-bold tracking-[-0.025em] text-label sm:text-[42px]">
            Wallpeace
          </p>
        </div>

        <p className="mx-auto mt-3 max-w-[44ch] text-[14px] leading-snug font-medium text-label-2 sm:text-[16px]">
          Wallpapers that bring peace and motivation to your day.
        </p>

        {/* The rule under it: short, and the only saturated thing in the band. */}
        <div className="mx-auto mt-5 h-[3px] w-11 rounded-full bg-gradient-to-r from-accent to-accent/35" />
      </section>
    </Reveal>
  );
}
