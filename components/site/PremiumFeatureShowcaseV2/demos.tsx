import Image from "next/image";
import { StarFill } from "@/components/ui/icons";
import { displayTitle } from "@/lib/format";
import { premiumDemoAssets as ASSETS, type DemoImage } from "@/lib/premium-demo-assets";
import { displayUrl } from "@/lib/storage";
import type { Wallpaper } from "@/types/database";
import { IPadFrame, IPhoneFrame, MacBookFrame } from "../Devices";
import { LiveVideo } from "../LiveVideo";
import { LockScreen } from "./LockScreen";

/**
 * The seven demonstrations, copied from `PremiumShowcase` so V2 can be tuned for full-screen
 * chapters without touching V1. Same keyframes, same devices, same asset slots — only the image
 * sizes are raised, because here each demo is drawn several times larger.
 */


/** A picture ready to put on a screen: an uploaded file, or a wallpaper from the library. */
export type Shot = { src: string; alt: string; blur: string | null };

export type Library = (slug: string, fallback: number) => Wallpaper;

/** Falls back to whatever the library does have, so a renamed or deleted wallpaper can't empty a demo. */
export function library(list: Wallpaper[]): Library {
  const bySlug = new Map(list.map((w) => [w.slug, w]));
  return (slug, fallback) => bySlug.get(slug) ?? list[fallback % list.length];
}

function alt(w: Wallpaper) {
  return `${displayTitle(w.title)} wallpaper`;
}

/** An owner-uploaded file when there is one, otherwise the library stand-in. */
export function slot(image: DemoImage, pick: Library, fallback: number, label: string): Shot {
  if (image.src) return { src: image.src, alt: `${label} wallpaper`, blur: null };
  const w = pick(image.slug, fallback);
  return { src: displayUrl(w), alt: alt(w), blur: w.blur_data_url };
}

export function Tier({ plus }: { plus?: boolean }) {
  return (
    <span className="inline-flex h-[22px] items-center gap-1 rounded-full bg-premium/15 px-2.5 text-[11.5px] font-semibold text-premium ring-1 ring-premium/25 backdrop-blur-sm">
      {plus && <StarFill width={9} height={9} className="text-premium" />}
      {plus ? "Premium+" : "Premium"}
    </span>
  );
}

/** A dark readout over a screen: the same small label everywhere in the demos. */
const READOUT =
  "rounded-[5px] bg-black/45 px-1.5 py-px text-[9px] font-semibold tracking-[0.02em] text-white/95 backdrop-blur-sm sm:text-[10px]";

/* --- 01 · Resolution ------------------------------------------------------------------------- */

/** The sizes the sequence climbs through, with the pixels behind each name. */
const STEPS = [
  { label: "4K", px: "3840 × 2160" },
  { label: "6K", px: "6016 × 3384" },
  { label: "8K", px: "7680 × 4320" },
];

/**
 * A MacBook arrives, the camera pushes slowly into its screen, and the picture resolves in three
 * steps while the readout counts 4K → 6K → 8K. It ends held on a clean, sharp 8K.
 */
export function Resolution({ w }: { w: Wallpaper }) {
  const start = 0.55;
  return (
    <MacBookFrame className="mx-auto w-full [animation:device-in_0.7s_var(--ease-mac)_both]">
      {/* The screen's contents move, not the frame: a camera push, not a growing laptop. */}
      <div className="absolute inset-0 [animation:push-in_7s_var(--ease-mac)_both]" style={{ animationDelay: `${start}s` }}>
        <Image
          src={displayUrl(w)}
          alt={alt(w)}
          fill
          sizes="(min-width: 1024px) 1100px, 92vw"
          placeholder={w.blur_data_url ? "blur" : "empty"}
          blurDataURL={w.blur_data_url ?? undefined}
          style={{ animationDelay: `${start}s` }}
          className="object-cover [animation:sharpen_7s_linear_both]"
        />
      </div>
      {/* Stacked in one spot so each size replaces the last, the way a display readout would. */}
      <div className="absolute bottom-[5%] left-[4%] grid">
        {STEPS.map((s, i) => {
          const last = i === STEPS.length - 1;
          return (
            <span
              key={s.label}
              style={{ animationDelay: `${0.9 + i * 2.1}s` }}
              className={`col-start-1 row-start-1 inline-flex items-center gap-1.5 self-end ${READOUT} ${
                last ? "[animation:chip-land_0.5s_var(--ease-mac)_both]" : "[animation:chip-cycle_2.2s_var(--ease-mac)_both]"
              }`}
            >
              {s.label}
              <span className="font-normal tabular-nums text-white/70">{s.px}</span>
            </span>
          );
        })}
      </div>
    </MacBookFrame>
  );
}

/* --- 02 · Every screen ----------------------------------------------------------------------- */

/** One device of a lineup, with what it is written underneath. */
function Lineup({
  label,
  ratio,
  width,
  animation,
  delay,
  children,
}: {
  label: string;
  /** Kept off the phone, where the narrow column would wrap it onto two lines. */
  ratio: string;
  width: string;
  animation: string;
  /** Seconds. The devices arrive one after another, left to right. */
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <div style={{ animationDelay: `${delay}s` }} className={`min-w-0 ${width} ${animation}`}>
      {children}
      <p className="mt-2 text-center text-[10px] text-label-3 sm:text-[11px]">
        {label}
        <span className="hidden sm:inline"> · {ratio}</span>
      </p>
    </div>
  );
}

/** MacBook first, then the iPad beside it, then the iPhone — each reframing the same scene as it lands. */
export function Screens({ w }: { w: Wallpaper }) {
  const framed = (position: string, sizes: string, delay: number) => (
    <Image
      src={displayUrl(w)}
      alt={alt(w)}
      fill
      sizes={sizes}
      style={{ objectPosition: position, animationDelay: `${delay}s` }}
      className="object-cover [animation:reframe_1.2s_var(--ease-mac)_both]"
    />
  );
  return (
    <div className="flex items-end justify-center gap-2.5 sm:gap-4">
      <Lineup label="MacBook" ratio="16:10" width="w-[56%]" animation="[animation:device-in_0.7s_var(--ease-mac)_both]" delay={0}>
        <MacBookFrame>{framed("50% 50%", "(min-width: 1024px) 640px, 55vw", 0.2)}</MacBookFrame>
      </Lineup>
      <Lineup label="iPad" ratio="3:4" width="w-[25%]" animation="[animation:enter-right_0.6s_var(--ease-mac)_both]" delay={0.6}>
        <IPadFrame>{framed("46% 42%", "(min-width: 1024px) 300px, 25vw", 0.8)}</IPadFrame>
      </Lineup>
      <Lineup label="iPhone" ratio="9:19.5" width="w-[13%]" animation="[animation:enter-right_0.6s_var(--ease-mac)_both]" delay={1.2}>
        <IPhoneFrame>{framed("52% 46%", "(min-width: 1024px) 180px, 14vw", 1.4)}</IPhoneFrame>
      </Lineup>
    </div>
  );
}

/* --- Devices drawn for V2 ------------------------------------------------------------------- */

/**
 * A display with a stand you can actually see. The shared `MonitorFrame` keeps its stand to a few
 * pale pixels, which vanishes on this section's pale sky once the demo is zoomed up; this one has a
 * shaded neck and a foot with a shadow under it.
 */
function Monitor({ className = "", style, children }: { className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <div className={className} style={style}>
      <div className="rounded-[5px] bg-[#1d1d1f] p-[1.1%] shadow-[0_18px_34px_-18px_rgb(12_38_90/0.55)]">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[2px] bg-fill">{children}</div>
      </div>
      <div aria-hidden className="mx-auto h-[14px] w-[12%] bg-[linear-gradient(90deg,#9ea1a6,#d9dbde_45%,#aeb1b5)]" />
      <div aria-hidden className="mx-auto h-[4px] w-[38%] rounded-[3px] bg-[linear-gradient(180deg,#d9dbde,#9ea1a6)] shadow-[0_6px_10px_-4px_rgb(12_38_90/0.45)]" />
    </div>
  );
}

/* --- 03 · Multi-monitor ---------------------------------------------------------------------- */

/** One display, then one on each side, then a single picture drifting across all three. */
export function MultiMonitor({ w }: { w: Wallpaper }) {
  const panels = [
    { animation: "[animation:enter-left_0.75s_var(--ease-mac)_both]", delay: 0.6 },
    { animation: "[animation:device-in_0.7s_var(--ease-mac)_both]", delay: 0 },
    { animation: "[animation:enter-right_0.75s_var(--ease-mac)_both]", delay: 0.6 },
  ];
  return (
    <div>
      <div className="flex items-end justify-center gap-2">
        {panels.map((p, i) => (
          <Monitor key={i} className={`flex-1 ${p.animation}`} style={{ animationDelay: `${p.delay}s` }}>
            {/* Each display is a window onto its third of one picture three displays wide. */}
            <div
              className="absolute inset-y-0 w-[300%] [animation:flow_5s_ease-in-out_both]"
              style={{ left: `${-100 * i}%`, animationDelay: "1.3s" }}
            >
              <Image
                src={displayUrl(w)}
                alt={i === 1 ? `${alt(w)} across three displays` : ""}
                fill
                sizes="(min-width: 1024px) 480px, 40vw"
                className="object-cover object-[50%_42%]"
              />
            </div>
          </Monitor>
        ))}
      </div>
      {/* The desk the stands are on, and the soft shadow they throw on it. */}
      <div aria-hidden className="mx-auto h-px w-[96%] bg-label/15" />
      <div aria-hidden className="mx-auto h-5 w-[86%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(12_38_90/0.16),transparent)]" />
    </div>
  );
}

/* --- 04 · Live ------------------------------------------------------------------------------- */

/**
 * A MacBook on its lock screen, with the live wallpaper playing behind the clock. Clicking unlocks
 * it to the desktop — menu bar and the same glass dock as the hero — with the wallpaper still
 * moving behind the icons. The uploaded video is used once it exists (see `liveWallpaper` in the
 * asset config); until then the library still drifts slowly so the screen is never frozen.
 */
export function Live({ w }: { w: Wallpaper }) {
  const { webm, mp4, poster } = ASSETS.liveWallpaper;
  const hasVideo = Boolean(webm || mp4);
  return (
    <MacBookFrame className="mx-auto w-full [animation:device-in_0.7s_var(--ease-mac)_both]">
      <LockScreen>
        {hasVideo ? (
          <LiveVideo webm={webm} mp4={mp4} poster={poster ?? displayUrl(w)} alt={alt(w)} />
        ) : (
          <Image
            src={displayUrl(w)}
            alt={alt(w)}
            fill
            sizes="(min-width: 1024px) 1100px, 92vw"
            placeholder={w.blur_data_url ? "blur" : "empty"}
            blurDataURL={w.blur_data_url ?? undefined}
            className="object-cover [animation:drift_18s_ease-in-out_infinite_alternate]"
          />
        )}
      </LockScreen>
    </MacBookFrame>
  );
}

/* --- 05 · Dynamic ---------------------------------------------------------------------------- */

/** Minimal line glyphs for the three states, drawn on a 16px grid. */
const PHASE_ICONS = {
  Day: (
    <>
      <circle cx="8" cy="8" r="2.8" />
      <path d="M8 1.6v1.6M8 12.8v1.6M1.6 8h1.6M12.8 8h1.6M3.5 3.5l1.1 1.1M11.4 11.4l1.1 1.1M3.5 12.5l1.1-1.1M11.4 4.6l1.1-1.1" />
    </>
  ),
  Sunset: (
    <>
      <path d="M4.2 10.6a3.8 3.8 0 0 1 7.6 0" />
      <path d="M1.6 10.6h12.8M4 13.4h8M8 2.4v2.2M3 5l1.3 1.3M13 5l-1.3 1.3" />
    </>
  ),
  Night: <path d="M12.8 9.6A5.2 5.2 0 1 1 6.4 3.2a4.2 4.2 0 0 0 6.4 6.4Z" />,
} as const;

const PHASES = ["Day", "Sunset", "Night"] as const;

/**
 * One wallpaper through a day: the day, sunset and night pictures stacked, each later one fading in
 * over the last and all of them fading back to day together, so the 12s loop has no seam. The real
 * pictures do the work — no filters, no tinted overlays.
 */
export function Dynamic({ day, sunset, night }: Record<"day" | "sunset" | "night", Shot>) {
  const START = "0.6s";
  const layer = (s: Shot, animation?: string) => (
    <Image
      src={s.src}
      alt={s.alt}
      fill
      sizes="(min-width: 1024px) 1100px, 92vw"
      placeholder={s.blur ? "blur" : "empty"}
      blurDataURL={s.blur ?? undefined}
      style={animation ? { animationDelay: START } : undefined}
      className={`object-cover ${animation ?? ""}`}
    />
  );
  return (
    <div className="mx-auto w-full">
      <Monitor className="[animation:device-in_0.7s_var(--ease-mac)_both]">
        {layer(day)}
        {layer(sunset, "opacity-0 [animation:dyn-sunset_12s_ease-in-out_infinite]")}
        {layer(night, "opacity-0 [animation:dyn-night_12s_ease-in-out_infinite]")}
      </Monitor>

      {/* The clock the wallpaper is on: one fill per day, with the hour named underneath. */}
      <div className="mx-auto mt-4 w-[86%]">
        <div className="h-px w-full bg-label/10">
          <div aria-hidden style={{ animationDelay: START }} className="h-full w-full origin-left bg-label/40 [animation:track_12s_linear_infinite]" />
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[10px] font-semibold tracking-[0.12em] sm:text-[11px]">
          {PHASES.map((p, i) => (
            <span key={p} className="contents">
              <span
                style={{ animationDelay: `${0.6 + i * 4}s` }}
                className="inline-flex items-center gap-1.5 text-label-2 opacity-35 [animation:phase_12s_ease-in-out_infinite] motion-reduce:opacity-100"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 16 16"
                  className="size-[1.25em] fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.4]"
                >
                  {PHASE_ICONS[p]}
                </svg>
                {p.toUpperCase()}
              </span>
              {i < PHASES.length - 1 && (
                <span aria-hidden className="text-label-3/60">
                  →
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --- 06 · Exclusive series ------------------------------------------------------------------- */

/**
 * A coverflow deck. Six slots — centre, two either side, and one hidden behind — and every card
 * walks them in turn: in from the right, a moment at the front with its name on it, then off to the
 * left, fading and blurring as it goes back. One `deck` keyframe describes that whole walk; each card
 * runs it shifted by its own place in the deck, so they move as one carousel.
 */
export function Series({ cards }: { cards: { label: string; w: Wallpaper }[] }) {
  // Six slots need six cards; a shorter deck repeats itself from the front.
  const deck = Array.from({ length: DECK_SLOTS }, (_, i) => cards[i % cards.length]);
  return (
    <div className="relative mx-auto aspect-[560/340] w-full [animation:device-in_0.7s_var(--ease-mac)_both]">
      {/* The pool of light the front card stands in. */}
      <div aria-hidden className="absolute inset-[-8%_16%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(255_255_255/0.95),rgb(255_255_255/0))]" />
      {deck.map((c, i) => (
        <div
          key={i}
          style={{ animationDelay: `${-((DECK_SLOTS - i) % DECK_SLOTS) * DECK_STEP}s` }}
          className="absolute inset-y-[8%] left-1/2 aspect-[3/4] -translate-x-1/2 [animation:deck_9s_var(--ease-mac)_infinite_both]"
        >
          <div className="relative size-full overflow-hidden rounded-[10px] bg-fill shadow-[0_26px_50px_-22px_rgb(12_38_90/0.55)]">
            <Image src={displayUrl(c.w)} alt={`${c.label}: ${alt(c.w)}`} fill sizes="(min-width: 1024px) 420px, 40vw" className="object-cover" />
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.18)_0%,rgb(0_0_0/0)_26%)]" />
            {/* A vignette rising from the bottom, darkest behind the words. */}
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(130%_62%_at_30%_100%,rgb(0_0_0/0.78)_0%,rgb(0_0_0/0.42)_45%,rgb(0_0_0/0)_100%)]" />
            <span className="absolute top-[6%] left-[8%] font-display text-[22px] leading-none font-medium text-white/95 tabular-nums">
              {String((i % cards.length) + 1).padStart(2, "0")}
            </span>
            <div className="absolute inset-x-[8%] bottom-[7%] text-white">
              <span aria-hidden className="block h-px w-7 bg-[#f5c46b]" />
              <p className="mt-2 font-display text-[26px] leading-none font-bold tracking-[-0.02em]">{c.label}</p>
              <p className="mt-1.5 text-[8.5px] leading-snug text-white/80">A complete series, one world.</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const DECK_SLOTS = 6;
/** Seconds each card spends in a slot; the `deck` keyframe is DECK_SLOTS of these long. */
const DECK_STEP = 1.5;

/* --- 07 · Custom requests -------------------------------------------------------------------- */

/** The stages a request passes through, and when in the sequence each one is reached. */
const FLOW = [
  { label: "Request", at: 0.3 },
  { label: "Creating", at: 1.1 },
  { label: "Finished", at: 4.7 },
  { label: "Added to library", at: 5.5 },
];

const ASK = "A quiet Japanese village at night, lanterns on, 16:10";
/** Seconds per character: fast enough to read as someone who knows what they want. */
const TYPE = 0.022;
const TYPE_FROM = 0.35;

/**
 * A request typed in one quick breath, and the wallpaper already forming behind it while the words
 * are still arriving — out of a coloured haze, into focus — until it is finished and filed away.
 */
export function Request({ w }: { w: Wallpaper }) {
  const typed = TYPE_FROM + ASK.length * TYPE;
  return (
    <div>
      <MacBookFrame className="mx-auto w-full [animation:device-in_0.7s_var(--ease-mac)_both]">
        {/* The screen waits, empty, until there is something to put on it. */}
        <div aria-hidden className="absolute inset-0 bg-[#e6eaf1]" />
        <Image
          src={displayUrl(w)}
          alt={alt(w)}
          fill
          sizes="(min-width: 1024px) 1100px, 92vw"
          placeholder={w.blur_data_url ? "blur" : "empty"}
          blurDataURL={w.blur_data_url ?? undefined}
          className="object-cover [animation:generate_3.8s_cubic-bezier(0.4,0,0.2,1)_0.9s_both]"
        />

        {/* Asked for, then made — the card swaps its contents rather than its place. */}
        <div className="absolute inset-x-0 top-[7%] grid justify-items-center px-[16%]">
          <div className="col-start-1 row-start-1 w-full max-w-[290px] rounded-[10px] bg-surface/90 p-3 shadow-card-hover backdrop-blur-md [animation:card-in-out_2.4s_var(--ease-mac)_0.2s_both]">
            <p className="text-[10px] font-semibold text-label-3">Your request</p>
            <p className="mt-1 text-[11px] leading-relaxed text-label sm:text-[12px]">
              {Array.from(ASK).map((ch, i) => (
                <span key={i} style={{ animationDelay: `${TYPE_FROM + i * TYPE}s` }} className="[animation:char-in_0.04s_linear_both]">
                  {ch}
                </span>
              ))}
              <span
                style={{ animationDelay: `${typed}s` }}
                className="ml-0.5 inline-block w-px translate-y-0.5 border-l border-label text-transparent [animation:char-in_0.04s_linear_both]"
              >
                |
              </span>
            </p>
          </div>
          <div className="col-start-1 row-start-1 w-full max-w-[290px] rounded-[10px] bg-surface/90 p-3 shadow-card-hover backdrop-blur-md [animation:card-in-out_3.2s_var(--ease-mac)_2.4s_both]">
            <p className="text-[10px] font-semibold text-label-3">Creating</p>
            <div className="mt-2.5 h-[3px] w-full overflow-hidden rounded-full bg-fill-2">
              <div aria-hidden className="h-full w-full origin-left rounded-full bg-premium [animation:progress_2.3s_var(--ease-mac)_2.5s_both]" />
            </div>
          </div>
        </div>

        <span className={`absolute bottom-[6%] left-[4%] ${READOUT} [animation:chip-land_0.6s_var(--ease-mac)_5.5s_both]`}>
          Added to your library
        </span>
      </MacBookFrame>

      {/* Where the request is, lit one stage at a time. */}
      <ol className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10px] font-semibold sm:text-[11px]">
        {FLOW.map((f, i) => (
          <li key={f.label} className="contents">
            <span style={{ animationDelay: `${f.at}s` }} className="inline-flex items-center gap-1.5 text-label-2 [animation:step-on_0.5s_var(--ease-mac)_both]">
              <span className="size-1.5 rounded-full bg-premium" />
              {f.label}
            </span>
            {i < FLOW.length - 1 && (
              <span aria-hidden className="text-label-3/60">
                →
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
