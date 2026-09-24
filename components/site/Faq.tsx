import { ChevronRight } from "@/components/ui/icons";
import { Reveal } from "./Reveal";

export type QA = { q: string; a: string };

/** The questions the home page answers: the library first, then what Premium changes. */
export const SITE_FAQ: QA[] = [
  {
    q: "Are the wallpapers really free?",
    a: "Yes. Everything in the open library downloads at full 4K with no account, no email and no watermark. Premium is a separate set on top of it, and it never takes anything away.",
  },
  {
    q: "Where do the wallpapers come from?",
    a: "They're made here, one at a time, and each one is checked on a real display before it goes up. Nothing is scraped, bulk-generated or reposted from somewhere else.",
  },
  {
    q: "What resolution do I get?",
    a: "Every free wallpaper is at least 3840 × 2160. Premium goes to 6K and Premium+ to 8K masters, with per-screen crops for Mac, iPad and iPhone.",
  },
  {
    q: "Can I use them at work, or in a video?",
    a: "Personal use is always fine — your desktop, phone, tablet, as many machines as you own. Commercial use comes with the Premium+ license.",
  },
  {
    q: "What's the difference between Premium and Premium+?",
    a: "Premium is the full wallpaper library up to 6K. Premium+ adds 8K masters, live and dynamic wallpapers, multi-monitor packs, custom requests and a commercial-use license.",
  },
  {
    q: "What does Premium cost?",
    a: "Premium is $5 and Premium+ is $15, each paid once. No subscription, no renewal, and the free library stays free either way.",
  },
];

/**
 * Questions and answers as native `<details>`: it opens without JavaScript, it is announced
 * correctly, and the browser's own find-in-page can open a closed answer to reach a match.
 */
export function Faq({
  items,
  title = "Questions",
  subtitle,
}: {
  items: QA[];
  title?: string;
  subtitle?: string;
}) {
  return (
    <section aria-labelledby="faq-title">
      <Reveal className="text-center">
        <h2
          id="faq-title"
          className="font-display text-[30px] font-semibold tracking-[-0.021em] text-label sm:text-[36px]"
        >
          {title}
        </h2>
        {subtitle && <p className="mx-auto mt-2 max-w-[52ch] text-[14px] text-label-2 sm:text-[15px]">{subtitle}</p>}
      </Reveal>

      <div className="mx-auto mt-8 max-w-[760px] overflow-hidden rounded-[14px] bg-surface shadow-card">
        {items.map((item, i) => (
          <details
            key={item.q}
            className={`group ${i > 0 ? "border-t border-separator" : ""}`}
          >
            <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 text-[15px] font-semibold text-label transition-colors duration-150 hover:bg-fill [&::-webkit-details-marker]:hidden sm:px-6">
              <span className="min-w-0 flex-1">{item.q}</span>
              <ChevronRight
                width={15}
                height={15}
                className="shrink-0 text-label-3 transition-transform duration-300 ease-(--ease-mac) group-open:rotate-90 motion-reduce:transition-none"
              />
            </summary>
            <p className="px-5 pb-5 text-[14px] leading-relaxed text-label-2 sm:px-6">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
