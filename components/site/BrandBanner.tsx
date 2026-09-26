import Image from "next/image";
import { Reveal } from "./Reveal";

/** Brand band between the studio and the library. */
export function BrandBanner() {
  return (
    <Reveal className="-mb-7 lg:-mb-9">
      <section
        aria-label="Wallpeace"
        className="relative isolate overflow-hidden rounded-t-[14px] px-6 pt-[15px] pb-16 text-center sm:pt-[31px] sm:pb-24"
      >
        <div
          aria-hidden
          className="absolute inset-0 -z-10 [mask-image:linear-gradient(180deg,black_0%,black_18%,rgb(0_0_0/0.88)_36%,rgb(0_0_0/0.58)_54%,rgb(0_0_0/0.28)_72%,rgb(0_0_0/0.08)_88%,transparent_100%)] [-webkit-mask-image:linear-gradient(180deg,black_0%,black_18%,rgb(0_0_0/0.88)_36%,rgb(0_0_0/0.58)_54%,rgb(0_0_0/0.28)_72%,rgb(0_0_0/0.08)_88%,transparent_100%)]"
        >
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#5eacff_0%,#8ec8ff_32%,#c9e8ff_72%,#f4f9ff_100%)]" />
          <SkyDecor />
        </div>

        <div className="relative inline-flex">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[190%] w-[175%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgb(255_255_255/0.88)_0%,rgb(255_255_255/0.5)_42%,transparent_70%)]"
          />
          <div className="relative inline-flex items-center gap-2.5 overflow-hidden rounded-[20px] bg-white/45 px-4 py-2.5 backdrop-blur-3xl backdrop-saturate-[1.1] backdrop-brightness-[1.03] sm:gap-3.5 sm:rounded-[26px] sm:px-6 sm:py-3.5 [box-shadow:inset_0_0_0_1px_rgb(255_255_255/0.5),inset_0_1px_1px_rgb(255_255_255/0.85),inset_0_10px_18px_-12px_rgb(255_255_255/0.6),inset_0_-10px_18px_-12px_rgb(255_255_255/0.45),0_14px_36px_-18px_rgb(0_0_0/0.3)]">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgb(255_255_255/0.45),rgb(255_255_255/0.08)_26%,transparent_46%),radial-gradient(90%_140%_at_50%_130%,rgb(255_255_255/0.2),transparent_60%)]"
            />
            <Image
              src="/logo.webp"
              alt=""
              width={52}
              height={52}
              unoptimized
              className="relative size-[34px] drop-shadow-[0_1px_3px_rgb(0_0_0/0.18)] sm:size-[46px]"
            />
            <p className="relative font-display text-[28px] font-bold tracking-[-0.025em] text-label sm:text-[40px]">
              Wallpeace
            </p>
          </div>
        </div>

        <p className="mx-auto mt-3.5 max-w-[44ch] text-[14px] leading-snug font-medium text-label-2 sm:text-[16px]">
          Wallpapers that bring peace and motivation to your day.
        </p>
        <div className="mx-auto mt-5 h-[3px] w-11 rounded-full bg-gradient-to-r from-accent to-accent/35" />
      </section>
    </Reveal>
  );
}

function SkyDecor() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1400 220"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <g fill="#fff" opacity="0.5">
        <ellipse cx="170" cy="50" rx="72" ry="15" />
        <ellipse cx="226" cy="44" rx="44" ry="11" />
        <ellipse cx="520" cy="38" rx="54" ry="12" />
        <ellipse cx="880" cy="42" rx="50" ry="11" />
        <ellipse cx="1210" cy="58" rx="64" ry="13" />
        <ellipse cx="1260" cy="52" rx="36" ry="9" />
      </g>
      <g fill="none" stroke="#4a6f9c" strokeWidth="1.55" strokeLinecap="round" opacity="0.48">
        <path d="M842 36c6-9 12-9 18 0 6-9 12-9 18 0" />
        <path d="M902 54c4.5-7 9-7 13.5 0 4.5-7 9-7 13.5 0" />
      </g>
    </svg>
  );
}
