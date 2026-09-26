import Image from "next/image";
import Link from "next/link";
import { StarFill } from "@/components/ui/icons";
import { withResLabels } from "@/components/ui/ResolutionBadge";
import { displayTitle } from "@/lib/format";
import { premiumDemoAssets as ASSETS, type DemoImage } from "@/lib/premium-demo-assets";
import { displayUrl } from "@/lib/storage";
import type { Wallpaper } from "@/types/database";
import { IPadFrame, IPhoneFrame, MacBookFrame, MonitorFrame } from "./Devices";
import { type Feature, FeatureStory } from "./FeatureStory";
import { LiveVideo } from "./LiveVideo";
import { Reveal } from "./Reveal";

/**
 * Every demonstration is a short sequence — arrive, move, transform, then hold on the finished
 * state — written as CSS animations with delays. `DemoPlayer` (inside `FeatureStory`) decides when a
 * sequence runs: it starts when its feature reaches the stage, loops while it stays there, and is
 * rewound once it leaves. None of the demos below know about scrolling.
 *
 * What each demo shows comes from `lib/premium-demo-assets.ts`, never from here.
 */

const FRAME = "relative overflow-hidden rounded-[12px] bg-fill shadow-card";

/** A picture ready to put on a screen: an uploaded file, or a wallpaper from the library. */
type Shot = { src: string; alt: string; blur: string | null };

type Library = (slug: string, fallback: number) => Wallpaper;

/** Falls back to whatever the library does have, so a renamed or deleted wallpaper can't empty a demo. */
function library(list: Wallpaper[]): Library {
  const bySlug = new Map(list.map((w) => [w.slug, w]));
  return (slug, fallback) => bySlug.get(slug) ?? list[fallback % list.length];
}

function alt(w: Wallpaper) {
  return `${displayTitle(w.title)} wallpaper`;
}

/** An owner-uploaded file when there is one, otherwise the library stand-in. */
function slot(image: DemoImage, pick: Library, fallback: number, label: string): Shot {
  if (image.src) return { src: image.src, alt: `${label} wallpaper`, blur: null };
  const w = pick(image.slug, fallback);
  return { src: displayUrl(w), alt: alt(w), blur: w.blur_data_url };
}

function Tier({ plus }: { plus?: boolean }) {
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
function Resolution({ w }: { w: Wallpaper }) {
  const start = 0.55;
  return (
    <MacBookFrame className="mx-auto w-full [animation:device-in_0.7s_var(--ease-mac)_both]">
      {/* The screen's contents move, not the frame: a camera push, not a growing laptop. */}
      <div className="absolute inset-0 [animation:push-in_7s_var(--ease-mac)_both]" style={{ animationDelay: `${start}s` }}>
        <Image
          src={displayUrl(w)}
          alt={alt(w)}
          fill
          sizes="(min-width: 1024px) 540px, 90vw"
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
function Screens({ w }: { w: Wallpaper }) {
  const framed = (position: string, sizes: string, delay: number) => (
    <Image
      src={displayUrl(w)}
      alt={alt(w)}
      fill
      sizes={sizes}
      style={{ objectPosition: position, animationDelay: `${delay}s` }}
      className="object-cover [animation:reframe_1.6s_var(--ease-mac)_both]"
    />
  );
  return (
    <div className="flex items-end justify-center gap-2.5 sm:gap-4">
      <Lineup label="MacBook" ratio="16:10" width="w-[56%]" animation="[animation:device-in_0.7s_var(--ease-mac)_both]" delay={0}>
        <MacBookFrame>{framed("50% 50%", "(min-width: 1024px) 300px, 50vw", 0.3)}</MacBookFrame>
      </Lineup>
      <Lineup label="iPad" ratio="3:4" width="w-[25%]" animation="[animation:enter-right_0.8s_var(--ease-mac)_both]" delay={0.9}>
        <IPadFrame>{framed("46% 42%", "(min-width: 1024px) 140px, 25vw", 1.2)}</IPadFrame>
      </Lineup>
      <Lineup label="iPhone" ratio="9:19.5" width="w-[13%]" animation="[animation:enter-right_0.8s_var(--ease-mac)_both]" delay={1.8}>
        <IPhoneFrame>{framed("52% 46%", "(min-width: 1024px) 80px, 14vw", 2.1)}</IPhoneFrame>
      </Lineup>
    </div>
  );
}

/* --- 03 · Multi-monitor ---------------------------------------------------------------------- */

/** One display, then one on each side, then a single picture drifting across all three. */
function MultiMonitor({ w }: { w: Wallpaper }) {
  const panels = [
    { animation: "[animation:enter-left_1s_var(--ease-mac)_both]", delay: 1 },
    { animation: "[animation:device-in_0.7s_var(--ease-mac)_both]", delay: 0 },
    { animation: "[animation:enter-right_1s_var(--ease-mac)_both]", delay: 1 },
  ];
  return (
    <div>
      <div className="flex items-end justify-center gap-1.5 sm:gap-2">
        {panels.map((p, i) => (
          <MonitorFrame key={i} className={`flex-1 ${p.animation}`} style={{ animationDelay: `${p.delay}s` }}>
            {/* Each display is a window onto its third of one picture three displays wide. */}
            <div
              className="absolute inset-y-0 w-[300%] [animation:flow_7s_ease-in-out_both]"
              style={{ left: `${-100 * i}%`, animationDelay: "2s" }}
            >
              <Image
                src={displayUrl(w)}
                alt={i === 1 ? `${alt(w)} across three displays` : ""}
                fill
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover object-[50%_42%]"
              />
            </div>
          </MonitorFrame>
        ))}
      </div>
      {/* The desk the stands are on, and the soft shadow they throw on it. */}
      <div aria-hidden className="mx-auto h-px w-[94%] bg-separator" />
      <div aria-hidden className="mx-auto h-4 w-[80%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(12_38_90/0.12),transparent)]" />
    </div>
  );
}

/* --- 04 · Live ------------------------------------------------------------------------------- */

/** A few motes of light, placed by hand so they sit over the scene rather than the sky. */
const MOTES = [
  { left: "16%", top: "66%", size: 3, dur: 7, delay: 1.6 },
  { left: "34%", top: "78%", size: 2, dur: 9, delay: 3.1 },
  { left: "52%", top: "58%", size: 2, dur: 8, delay: 2.2 },
  { left: "71%", top: "72%", size: 3, dur: 10, delay: 4.4 },
  { left: "86%", top: "62%", size: 2, dur: 8.5, delay: 5.6 },
];

/**
 * The real live wallpaper once it has been uploaded (see `liveWallpaper` in the asset config).
 * Until then, the library still with a slow drift and a few motes, so the slot is never empty —
 * and none of that runs once the video exists.
 */
function Live({ w }: { w: Wallpaper }) {
  const { webm, mp4, poster } = ASSETS.liveWallpaper;
  const hasVideo = Boolean(webm || mp4);
  return (
    <MacBookFrame className="mx-auto w-full [animation:device-in_0.7s_var(--ease-mac)_both]">
      {hasVideo ? (
        <LiveVideo webm={webm} mp4={mp4} poster={poster ?? displayUrl(w)} alt={alt(w)} />
      ) : (
        <>
          <Image
            src={displayUrl(w)}
            alt={alt(w)}
            fill
            sizes="(min-width: 1024px) 540px, 90vw"
            placeholder={w.blur_data_url ? "blur" : "empty"}
            blurDataURL={w.blur_data_url ?? undefined}
            style={{ animationDelay: "1.2s" }}
            className="object-cover [animation:drift_18s_ease-in-out_infinite_alternate]"
          />
          {MOTES.map((m, i) => (
            <span
              key={i}
              aria-hidden
              style={{
                left: m.left,
                top: m.top,
                width: m.size,
                height: m.size,
                animationDuration: `${m.dur}s`,
                animationDelay: `${m.delay}s`,
              }}
              className="pointer-events-none absolute rounded-full bg-white/80 blur-[0.5px] [animation:float_8s_ease-in-out_infinite]"
            />
          ))}
        </>
      )}
      {/* The indicator arrives after the motion does, never before. */}
      <span className="absolute top-[6%] left-[4%] inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2 py-px text-[9px] font-semibold tracking-[0.06em] text-white/95 backdrop-blur-sm [animation:chip-land_0.6s_var(--ease-mac)_1.4s_both] sm:text-[10px]">
        <span className="size-1.5 rounded-full bg-[#ff453a] motion-safe:animate-pulse" />
        LIVE
      </span>
    </MacBookFrame>
  );
}

/* --- 05 · Dynamic ---------------------------------------------------------------------------- */

const PHASES = ["Day", "Sunset", "Night"] as const;

/**
 * One wallpaper through a day: the day, sunset and night pictures stacked, each later one fading in
 * over the last and all of them fading back to day together, so the 12s loop has no seam. The real
 * pictures do the work — no filters, no tinted overlays.
 */
function Dynamic({ day, sunset, night }: Record<"day" | "sunset" | "night", Shot>) {
  const START = "0.6s";
  const layer = (s: Shot, animation?: string) => (
    <Image
      src={s.src}
      alt={s.alt}
      fill
      sizes="(min-width: 1024px) 540px, 90vw"
      placeholder={s.blur ? "blur" : "empty"}
      blurDataURL={s.blur ?? undefined}
      style={animation ? { animationDelay: START } : undefined}
      className={`object-cover ${animation ?? ""}`}
    />
  );
  return (
    <div className="mx-auto w-full">
      <MonitorFrame className="[animation:device-in_0.7s_var(--ease-mac)_both]">
        {layer(day)}
        {layer(sunset, "opacity-0 [animation:dyn-sunset_12s_ease-in-out_infinite]")}
        {layer(night, "opacity-0 [animation:dyn-night_12s_ease-in-out_infinite]")}
      </MonitorFrame>

      {/* The clock the wallpaper is on: one fill per day, with the hour named underneath. */}
      <div className="mx-auto mt-5 w-[86%]">
        <div className="h-px w-full bg-label/10">
          <div aria-hidden style={{ animationDelay: START }} className="h-full w-full origin-left bg-label/40 [animation:track_12s_linear_infinite]" />
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[10px] font-semibold tracking-[0.12em] sm:text-[11px]">
          {PHASES.map((p, i) => (
            <span key={p} className="contents">
              <span
                style={{ animationDelay: `${0.6 + i * 4}s` }}
                className="text-label-2 opacity-35 [animation:phase_12s_ease-in-out_infinite] motion-reduce:opacity-100"
              >
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

/** The fan finishes here; the walk through the categories follows it. */
const FANNED = 2.4;

const FAN = [
  { x: "-34%", r: "-9deg" },
  { x: "-11%", r: "-3deg" },
  { x: "11%", r: "3deg" },
  { x: "34%", r: "9deg" },
];

/** A stack of series that fans out one card at a time, then hands the front to each category. */
function Series({ cards }: { cards: { label: string; w: Wallpaper }[] }) {
  return (
    // Tall enough for a fanned card: they are 46% wide and turn up to 9°.
    <div className="relative aspect-[2.4/1] w-full">
      {cards.map((c, i) => {
        const focus = `${FANNED + i * 0.9}s`;
        const { x, r } = FAN[i % FAN.length];
        return (
          <div key={c.label} className="absolute inset-0 flex items-center justify-center">
            {/* The fan lives on the outer element and the focus on the inner one: two animations on
             *  one element would each set `transform`, and the later one would win outright. */}
            <div
              style={{ "--x": x, "--r": r, animationDelay: `${i * 0.22}s` } as React.CSSProperties}
              className="w-[46%] [animation:fan_1.6s_var(--ease-mac)_both]"
            >
              <div style={{ animationDelay: focus }} className="relative [animation:focus-pop_0.9s_var(--ease-mac)_both]">
                <div className={`${FRAME} aspect-[16/10] rounded-[10px]`}>
                  <Image src={displayUrl(c.w)} alt={`${c.label}: ${alt(c.w)}`} fill sizes="(min-width: 1024px) 260px, 45vw" className="object-cover" />
                  <span
                    style={{ animationDelay: focus }}
                    className={`absolute bottom-[6%] left-[6%] ${READOUT} [animation:label-in_0.5s_var(--ease-mac)_both]`}
                  >
                    {c.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* --- 07 · Custom requests -------------------------------------------------------------------- */

/** The stages a request passes through, and when in the sequence each one is reached. */
const FLOW = [
  { label: "Request", at: 0.5 },
  { label: "Creating", at: 2.9 },
  { label: "Finished", at: 4.9 },
  { label: "Added to library", at: 6.4 },
];

/** A request, the making of it, and the wallpaper arriving on the machine that asked. */
function Request({ w }: { w: Wallpaper }) {
  return (
    <div>
      <div className="relative">
        <MacBookFrame className="mx-auto w-full [animation:device-in_0.7s_var(--ease-mac)_both]">
          {/* The screen waits, empty, until there is something to put on it. */}
          <div aria-hidden className="absolute inset-0 bg-fill-2" />
          <Image
            src={displayUrl(w)}
            alt={alt(w)}
            fill
            sizes="(min-width: 1024px) 540px, 90vw"
            placeholder={w.blur_data_url ? "blur" : "empty"}
            blurDataURL={w.blur_data_url ?? undefined}
            className="object-cover [animation:wipe_1.1s_var(--ease-mac)_4.9s_both]"
          />
          <span className={`absolute bottom-[6%] left-[4%] ${READOUT} [animation:chip-land_0.6s_var(--ease-mac)_6.4s_both]`}>
            Added to your library
          </span>
        </MacBookFrame>

        {/* The two steps before it, over the waiting screen: asked for, then made. They share one
         *  grid cell, so the second takes the first one's place rather than sitting beside it. */}
        <div className="absolute inset-x-0 top-[13%] grid justify-items-center px-[12%]">
          <div className="col-start-1 row-start-1 w-full max-w-[280px] rounded-[10px] bg-surface p-3 shadow-card-hover [animation:card-in-out_2.6s_var(--ease-mac)_0.5s_both]">
            <p className="text-[10px] font-semibold text-label-3">Your request</p>
            <p className="mt-1 text-[11px] leading-relaxed text-label sm:text-[12px]">
              A quiet Japanese village at night, lanterns on, 16:10
              <span className="ml-0.5 inline-block w-px translate-y-0.5 border-l border-label text-transparent [animation:caret_1.1s_steps(1)_infinite]">
                |
              </span>
            </p>
          </div>
          <div className="col-start-1 row-start-1 w-full max-w-[280px] rounded-[10px] bg-surface p-3 shadow-card-hover [animation:card-in-out_2.2s_var(--ease-mac)_2.9s_both]">
            <p className="text-[10px] font-semibold text-label-3">Creating</p>
            <div className="mt-2.5 h-[3px] w-full overflow-hidden rounded-full bg-fill-2">
              <div aria-hidden className="h-full w-full origin-left rounded-full bg-premium [animation:progress_2s_var(--ease-mac)_3.1s_both]" />
            </div>
          </div>
        </div>
      </div>

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

/* --- The section ----------------------------------------------------------------------------- */

/** What the paid tiers actually look like, told one feature at a time as the page scrolls. */
export function PremiumShowcase({ wallpapers }: { wallpapers: Wallpaper[] }) {
  if (!wallpapers.length) return null;
  const pick = library(wallpapers);

  const features: Feature[] = [
    {
      id: "resolution",
      name: "4K, 6K and 8K",
      tier: <Tier />,
      title: withResLabels("4K → 6K → 8K"),
      body: withResLabels(
        "Premium goes to 6K and Premium+ to 8K, so the same scene keeps its detail on a Pro Display XDR.",
      ),
      loop: 9.5,
      demo: <Resolution w={pick(ASSETS.resolution, 0)} />,
    },
    {
      id: "screens",
      name: "Every screen",
      tier: <Tier plus />,
      title: "Every screen",
      body: "Reframed for each shape — MacBook, iPad, iPhone — not one crop stretched to fit all three.",
      loop: 7,
      demo: <Screens w={pick(ASSETS.screens, 1)} />,
    },
    {
      id: "multi-monitor",
      name: "Multi-monitor packs",
      tier: <Tier plus />,
      title: "Multi-monitor packs",
      body: "One picture cut across two or three displays, with no seam in the wrong place.",
      loop: 10,
      demo: <MultiMonitor w={pick(ASSETS.multiMonitor, 2)} />,
    },
    {
      id: "live",
      name: "Live wallpapers",
      tier: <Tier plus />,
      title: "Live wallpapers",
      body: "Slow, looping motion behind your icons: enough to feel alive on wake, never enough to pull your eye.",
      demo: <Live w={pick(ASSETS.liveWallpaper.slug, 3)} />,
    },
    {
      id: "dynamic",
      name: "Dynamic wallpapers",
      tier: <Tier plus />,
      title: "Dynamic wallpapers",
      body: "Bright through the day, warm at sunset, dark after night falls — the wallpaper follows your clock.",
      demo: (
        <Dynamic
          day={slot(ASSETS.dynamic.day, pick, 4, "Day")}
          sunset={slot(ASSETS.dynamic.sunset, pick, 5, "Sunset")}
          night={slot(ASSETS.dynamic.night, pick, 6, "Night")}
        />
      ),
    },
    {
      id: "series",
      name: "Exclusive series",
      tier: <Tier plus />,
      title: "Exclusive series",
      body: "Whole sets built around one world — Games · Cars · Anime · Movies — with a new drop every month.",
      loop: 8,
      demo: <Series cards={ASSETS.exclusiveSeries.map((s, i) => ({ label: s.label, w: pick(s.slug, 7 + i) }))} />,
    },
    {
      id: "requests",
      name: "Custom requests",
      tier: <Tier plus />,
      title: "Custom requests",
      body: "Describe the scene and the ratio. It gets made, and it lands in your library.",
      loop: 9.5,
      demo: <Request w={pick(ASSETS.customRequest, 11)} />,
    },
  ];

  return (
    <section
      aria-labelledby="showcase-title"
      // `overflow-clip`, not `overflow-hidden`: hidden would make the section a scroll container and
      // the stage inside it would stop sticking.
      className="relative isolate overflow-clip rounded-[22px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12"
    >
      {/* The pale end of the pricing sky, so the two sections are the same weather. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#e8f1fd_0%,#f6fafe_44%,#e9f1fb_100%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <span className="absolute -top-[6%] -left-[10%] size-[420px] rounded-full bg-[#bcd8fb] opacity-50 blur-[110px]" />
        <span className="absolute top-[40%] -right-[12%] size-[460px] rounded-full bg-[#cfd9fa] opacity-45 blur-[120px]" />
        <span className="absolute -bottom-[6%] left-[28%] size-[380px] rounded-full bg-[#ffe6c0] opacity-30 blur-[120px]" />
      </div>

      <Reveal className="mx-auto max-w-[44rem] text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1 text-[12px] font-semibold text-premium ring-1 ring-white/70 backdrop-blur-sm">
          <StarFill width={10} height={10} />
          Premium
        </span>
        <h2
          id="showcase-title"
          className="mx-auto mt-4 max-w-[18ch] font-display text-[35px] leading-[1.04] font-bold tracking-[-0.032em] text-label sm:text-[45px] lg:text-[49px]"
        >
          What Premium adds
        </h2>
        <p className="mx-auto mt-3 max-w-[52ch] text-[14px] leading-relaxed text-label-2 sm:text-[15px]">
          More ways to make your screen yours.
        </p>
      </Reveal>

      <FeatureStory features={features} />

      <Reveal className="mt-12 text-center lg:mt-4">
        <Link
          href="/premium"
          className="inline-flex items-center gap-1.5 rounded-full bg-white/65 px-5 py-2.5 text-[14px] font-semibold text-label ring-1 ring-white/75 backdrop-blur-sm transition-colors duration-200 hover:bg-white/85"
        >
          See everything Premium adds
          <span aria-hidden>→</span>
        </Link>
      </Reveal>
    </section>
  );
}
