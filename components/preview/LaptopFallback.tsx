/* eslint-disable @next/next/no-img-element */
import { FINISHES, type Finish } from "./finishes";

/** Flat CSS laptop: instant first paint, and the whole preview when WebGL is unavailable. */
export function LaptopFallback({ src, alt, finish }: { src: string; alt: string; finish: Finish }) {
  return (
    <div className="mx-auto w-[min(72%,860px)]">
      <div className="rounded-t-[3%_4.6%] bg-[#060607] p-[1.3%] pb-[1.9%] shadow-[0_0_0_1px_rgb(0_0_0/0.15)]">
        <div className="relative aspect-[1.54] overflow-hidden rounded-[0.6%]">
          <img src={src} alt={alt} className="absolute inset-0 size-full object-cover" />
        </div>
      </div>
      <div
        className="relative -mx-[6%] h-[clamp(8px,1.4vw,15px)] rounded-b-[50%_100%] shadow-[0_18px_30px_-12px_rgb(0_0_0/0.35)]"
        style={{ background: `linear-gradient(to bottom, ${FINISHES[finish].css}, color-mix(in srgb, ${FINISHES[finish].css} 72%, black))` }}
      >
        <div className="absolute left-1/2 top-0 h-[40%] w-[14%] -translate-x-1/2 rounded-b-[6px] bg-black/15" />
      </div>
    </div>
  );
}
