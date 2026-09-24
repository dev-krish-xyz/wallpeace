import Image from "next/image";
import { StarFill } from "@/components/ui/icons";
import { displayTitle } from "@/lib/format";
import { displayUrl } from "@/lib/storage";
import type { Wallpaper } from "@/types/database";
import { IPadFrame, IPhoneFrame, MacBookFrame, MonitorFrame } from "./Devices";
import { Parallax } from "./Parallax";
import { Reveal } from "./Reveal";
import { Scene } from "./Scene";

/**
 * Every demonstration runs itself as a short sequence — fade in, move, transform, then hold on the
 * finished state — and starts over whenever its row comes back on screen. `Scene` marks itself
 * `data-shown` while it is in view; the `[data-scene]` rule in globals.css cancels every animation
 * inside it while it is not, which is what makes the replay possible. Nothing needs a click.
 */

const FRAME = "relative overflow-hidden rounded-[12px] bg-fill shadow-card";

/** The wallpapers each demonstration would like, by slug, in order of preference. */
const CAST = {
  resolution: "giant-tree-island-4k",
  screens: "cherry-blossom-tokyo-skyline-4k",
  panorama: "mediterranean-coastal-village-4k",
  live: "japanese-street-at-dusk-4k",
  daynight: "sunrise-over-rice-fields-4k",
  custom: "japanese-village-at-night-4k",
  games: "pirate-ship-tropical-beach-4k",
  cars: "sports-car-country-road-4k",
  anime: "sakura-shopping-street-4k",
  movies: "samurai-maple-waterfall-4k",
} as const;

type Cast = Record<keyof typeof CAST, Wallpaper>;

/** Falls back to whatever the library does have, so a renamed or deleted wallpaper can't empty a row. */
function castWallpapers(list: Wallpaper[]): Cast | null {
  if (!list.length) return null;
  const bySlug = new Map(list.map((w) => [w.slug, w]));
  const keys = Object.keys(CAST) as (keyof typeof CAST)[];
  return Object.fromEntries(
    keys.map((k, i) => [k, bySlug.get(CAST[k]) ?? list[i % list.length]]),
  ) as Cast;
}

function alt(w: Wallpaper) {
  return `${displayTitle(w.title)} wallpaper`;
}

function Tier({ plus }: { plus?: boolean }) {
  return (
    <span className="inline-flex h-[22px] items-center gap-1 rounded-full bg-premium/12 px-2.5 text-[12px] font-semibold text-premium">
      {plus && <StarFill width={9} height={9} className="text-premium" />}
      {plus ? "Premium+" : "Premium"}
    </span>
  );
}

/** One demonstration: a short caption beside the thing itself. */
function Demo({
  tier,
  title,
  body,
  flip,
  children,
}: {
  tier: React.ReactNode;
  title: string;
  body: string;
  /** Put the caption on the right instead, so the rows alternate down the page. */
  flip?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Scene className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
      <div className={`min-w-0 ${flip ? "lg:order-2" : ""}`}>
        {tier}
        <h3 className="mt-3.5 font-display text-[25px] font-semibold tracking-[-0.02em] text-label sm:text-[29px]">{title}</h3>
        <p className="mt-2.5 max-w-[46ch] text-[16px] leading-relaxed text-label-2 sm:text-[17px]">{body}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </Scene>
  );
}

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
  // The push runs the length of the sequence; the readouts hand over inside it.
  const start = 0.55;
  return (
    <Parallax amount={10}>
      <MacBookFrame className="mx-auto w-[94%] [animation:device-in_0.7s_var(--ease-mac)_both] sm:w-[92%]">
        {/* The screen's contents move, not the frame: a camera push, not a growing laptop. */}
        <div
          className="absolute inset-0 [animation:push-in_7s_var(--ease-mac)_both]"
          style={{ animationDelay: `${start}s` }}
        >
          <Image
            src={displayUrl(w)}
            alt={alt(w)}
            fill
            sizes="(min-width: 1024px) 520px, 90vw"
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
                className={`col-start-1 row-start-1 inline-flex items-center gap-1.5 self-end rounded-[5px] bg-black/45 px-1.5 py-px text-[9px] font-semibold tracking-[0.02em] text-white/95 backdrop-blur-sm sm:text-[10px] ${
                  last
                    ? "[animation:chip-land_0.5s_var(--ease-mac)_both]"
                    : "[animation:chip-cycle_2.2s_var(--ease-mac)_both]"
                }`}
              >
                {s.label}
                <span className="font-normal tabular-nums text-white/70">{s.px}</span>
              </span>
            );
          })}
        </div>
      </MacBookFrame>
    </Parallax>
  );
}

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
  const shot = (position: string, sizes: string, delay: number) => (
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
      <Lineup
        label="Desktop"
        ratio="16:10"
        width="w-[56%]"
        animation="[animation:device-in_0.7s_var(--ease-mac)_both]"
        delay={0}
      >
        <MacBookFrame>{shot("50% 50%", "(min-width: 1024px) 300px, 50vw", 0.3)}</MacBookFrame>
      </Lineup>
      <Lineup
        label="Tablet"
        ratio="3:4"
        width="w-[25%]"
        animation="[animation:enter-right_0.8s_var(--ease-mac)_both]"
        delay={0.7}
      >
        <IPadFrame>{shot("46% 42%", "(min-width: 1024px) 140px, 25vw", 1)}</IPadFrame>
      </Lineup>
      <Lineup
        label="Phone"
        ratio="9:19.5"
        width="w-[13%]"
        animation="[animation:enter-right_0.8s_var(--ease-mac)_both]"
        delay={1.4}
      >
        <IPhoneFrame>{shot("52% 46%", "(min-width: 1024px) 80px, 14vw", 1.7)}</IPhoneFrame>
      </Lineup>
    </div>
  );
}

/** One display, then one on each side, then a single picture drifting across all three. */
function MultiMonitor({ w }: { w: Wallpaper }) {
  const panels = [
    { animation: "[animation:enter-left_0.9s_var(--ease-mac)_both]", delay: 0.5 },
    { animation: "[animation:device-in_0.7s_var(--ease-mac)_both]", delay: 0 },
    { animation: "[animation:enter-right_0.9s_var(--ease-mac)_both]", delay: 0.5 },
  ];
  return (
    <div>
      <div className="flex items-end justify-center gap-1.5 sm:gap-2">
        {panels.map((p, i) => (
          <MonitorFrame key={i} className={`flex-1 ${p.animation}`} style={{ animationDelay: `${p.delay}s` }}>
            {/* Each display is a window onto its third of one picture three displays wide. */}
            <div
              className="absolute inset-y-0 w-[300%] [animation:flow_9s_ease-in-out_both]"
              style={{ left: `${-100 * i}%`, animationDelay: "1.5s" }}
            >
              <Image
                src={displayUrl(w)}
                alt={i === 1 ? `${alt(w)} across three displays` : ""}
                fill
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover"
              />
            </div>
          </MonitorFrame>
        ))}
      </div>
      {/* The desk the stands are on: one line is enough to sit them down. */}
      <div aria-hidden className="mx-auto h-px w-[94%] bg-separator" />
    </div>
  );
}

/** Everything holds still this long, so the moment the wallpaper starts moving is the point. */
const WAKE = "1.2s";

/** A few motes of light, placed by hand so they sit over the scene rather than the sky. */
const MOTES = [
  { left: "16%", top: "66%", size: 3, dur: 7, delay: 1.6 },
  { left: "34%", top: "78%", size: 2, dur: 9, delay: 3.1 },
  { left: "52%", top: "58%", size: 2, dur: 8, delay: 2.2 },
  { left: "71%", top: "72%", size: 3, dur: 10, delay: 4.4 },
  { left: "86%", top: "62%", size: 2, dur: 8.5, delay: 5.6 },
];

/** A still wallpaper that wakes up: light crosses it, the scene breathes, and it never stops. */
function Live({ w }: { w: Wallpaper }) {
  return (
    <Parallax amount={8}>
      <MacBookFrame className="mx-auto w-[94%] [animation:device-in_0.7s_var(--ease-mac)_both] sm:w-[92%]">
        {/* The breath. `alternate` returns it to exactly where it started, so the loop has no cut. */}
        <Image
          src={displayUrl(w)}
          alt={alt(w)}
          fill
          sizes="(min-width: 1024px) 520px, 90vw"
          placeholder={w.blur_data_url ? "blur" : "empty"}
          blurDataURL={w.blur_data_url ?? undefined}
          style={{ animationDelay: WAKE }}
          className="object-cover [animation:drift_18s_ease-in-out_infinite_alternate]"
        />
        {/* Weather across the sky, then light moving over everything below it. */}
        <div
          aria-hidden
          style={{ animationDelay: WAKE }}
          className="pointer-events-none absolute inset-x-0 top-0 h-[58%] bg-[radial-gradient(58%_80%_at_50%_38%,rgb(255_255_255/0.45),transparent_72%)] [animation:cloud-pass_26s_linear_infinite]"
        />
        <div
          aria-hidden
          style={{ animationDelay: WAKE }}
          className="pointer-events-none absolute inset-y-0 w-1/4 bg-white/10 blur-xl [animation:sweep_9s_var(--ease-mac)_infinite]"
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
        {/* The indicator arrives after the motion does, never before. */}
        <span className="absolute top-[6%] left-[4%] inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2 py-px text-[9px] font-semibold tracking-[0.04em] text-white/95 backdrop-blur-sm [animation:chip-land_0.6s_var(--ease-mac)_1.9s_both] sm:text-[10px]">
          <span className="size-1.5 rounded-full bg-premium motion-safe:animate-pulse" />
          LIVE
        </span>
      </MacBookFrame>
    </Parallax>
  );
}

/** Stars for the night stretch, spread across the top of the frame. */
const STARS = [
  { left: "12%", top: "14%" },
  { left: "26%", top: "8%" },
  { left: "38%", top: "20%" },
  { left: "54%", top: "11%" },
  { left: "67%", top: "22%" },
  { left: "79%", top: "9%" },
  { left: "90%", top: "18%" },
];

/** One landscape walked from midday to golden hour to night, with a timeline that follows it. */
function DayNight({ w }: { w: Wallpaper }) {
  const phases = ["Day", "Sunset", "Night"];
  // The cycle, and everything reading off it, starts once the display has arrived.
  const START = "0.6s";
  return (
    <Parallax amount={8}>
      <div className="mx-auto w-[94%] sm:w-[92%]">
        <MonitorFrame className="[animation:device-in_0.7s_var(--ease-mac)_both]">
          <Image
            src={displayUrl(w)}
            alt={alt(w)}
            fill
            sizes="(min-width: 1024px) 520px, 90vw"
            placeholder={w.blur_data_url ? "blur" : "empty"}
            blurDataURL={w.blur_data_url ?? undefined}
            style={{ animationDelay: START }}
            className="object-cover [animation:daylight-tone_12s_ease-in-out_infinite]"
          />
          {STARS.map((s, i) => (
            <span
              key={i}
              aria-hidden
              style={{ left: s.left, top: s.top, animationDelay: START }}
              className="absolute size-px rounded-full bg-white shadow-[0_0_3px_1px_rgb(255_255_255/0.6)] [animation:stars_12s_ease-in-out_infinite]"
            />
          ))}
          <div
            aria-hidden
            style={{ animationDelay: START }}
            className="absolute inset-0 [animation:daylight_12s_ease-in-out_infinite]"
          />
        </MonitorFrame>

        {/* The clock the wallpaper is on: one fill per day, with the hour named underneath. */}
        <div className="mt-4">
          <div className="h-px w-full bg-fill-2">
            <div
              aria-hidden
              style={{ animationDelay: START }}
              className="h-full w-full origin-left bg-label-3 [animation:track_12s_linear_infinite]"
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            {phases.map((p, i) => (
              <span
                key={p}
                style={{ animationDelay: `${0.6 + i * 4}s` }}
                className="text-[10px] font-medium text-label-2 opacity-35 [animation:phase_12s_ease-in-out_infinite] motion-reduce:opacity-100 sm:text-[11px]"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Parallax>
  );
}

/** The fan finishes here; the walk through the categories follows it. */
const FANNED = 2.1;

/** A stack of series that fans out, then hands the front to each category in turn. */
function Series({ cast }: { cast: Cast }) {
  const cards = [
    { w: cast.games, label: "Games", x: "-34%", r: "-9deg" },
    { w: cast.cars, label: "Cars", x: "-11%", r: "-3deg" },
    { w: cast.anime, label: "Anime", x: "11%", r: "3deg" },
    { w: cast.movies, label: "Movies", x: "34%", r: "9deg" },
  ];
  return (
    // Tall enough for a fanned card: they are 46% wide and turn up to 9°.
    <div className="relative aspect-[2/1] w-full">
      {cards.map((c, i) => {
        const focus = `${FANNED + i * 0.9}s`;
        return (
          <div key={c.label} className="absolute inset-0 flex items-center justify-center">
            {/* The fan lives on the outer element and the focus on the inner one: two animations on
             *  one element would each set `transform`, and the later one would win outright. */}
            <div
              style={{ "--x": c.x, "--r": c.r, animationDelay: `${i * 0.1}s` } as React.CSSProperties}
              className="w-[46%] [animation:fan_1.6s_var(--ease-mac)_both]"
            >
              <div
                style={{ animationDelay: focus }}
                className="relative [animation:focus-pop_0.9s_var(--ease-mac)_both]"
              >
                <div className={`${FRAME} aspect-[16/10] rounded-[10px]`}>
                  <Image
                    src={displayUrl(c.w)}
                    alt={`${c.label}: ${alt(c.w)}`}
                    fill
                    sizes="(min-width: 1024px) 260px, 45vw"
                    className="object-cover"
                  />
                  <span
                    style={{ animationDelay: focus }}
                    className="absolute bottom-[6%] left-[6%] rounded-[5px] bg-black/45 px-1.5 py-px text-[9px] font-semibold tracking-[0.02em] text-white/95 backdrop-blur-sm [animation:label-in_0.5s_var(--ease-mac)_both] sm:text-[10px]"
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

/** A request, the making of it, and the wallpaper arriving on the machine that asked. */
function Request({ w }: { w: Wallpaper }) {
  return (
    <div className="relative">
      <MacBookFrame className="mx-auto w-[94%] [animation:device-in_0.7s_var(--ease-mac)_both] sm:w-[92%]">
        {/* The screen waits, empty, until there is something to put on it. */}
        <div aria-hidden className="absolute inset-0 bg-fill-2" />
        <Image
          src={displayUrl(w)}
          alt={alt(w)}
          fill
          sizes="(min-width: 1024px) 480px, 90vw"
          placeholder={w.blur_data_url ? "blur" : "empty"}
          blurDataURL={w.blur_data_url ?? undefined}
          className="object-cover [animation:wipe_1.1s_var(--ease-mac)_4.9s_both]"
        />
        <span className="absolute bottom-[6%] left-[4%] rounded-[5px] bg-black/45 px-1.5 py-px text-[9px] font-semibold text-white/95 backdrop-blur-sm [animation:chip-land_0.6s_var(--ease-mac)_6.4s_both] sm:text-[10px]">
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
          <p className="text-[10px] font-semibold text-label-3">Making it</p>
          <div className="mt-2.5 h-[3px] w-full overflow-hidden rounded-full bg-fill-2">
            <div
              aria-hidden
              className="h-full w-full origin-left rounded-full bg-premium [animation:progress_2s_var(--ease-mac)_3.1s_both]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** What the paid tiers actually look like, shown with the library's own wallpapers. */
export function PremiumShowcase({ wallpapers }: { wallpapers: Wallpaper[] }) {
  const cast = castWallpapers(wallpapers);
  if (!cast) return null;

  return (
    // Panels slide in from off their own edges and cards fan past theirs; clip so neither can
    // widen the page on a phone. `clip`, not `hidden`: no scroll container, no trapped fixed children.
    <section aria-labelledby="showcase-title" className="overflow-x-clip">
      <Reveal className="max-w-[720px]">
        <h2 id="showcase-title" className="font-display text-[30px] font-semibold tracking-[-0.021em] text-label sm:text-[36px]">
          What Premium adds
        </h2>
        <p className="mt-2 text-[15px] leading-snug text-label-2 sm:text-[16px]">
          Shown with wallpapers from the free library. The premium versions go further in every direction.
        </p>
      </Reveal>

      <div className="mt-9 flex flex-col gap-12 lg:gap-16">
        <Demo
          tier={<Tier />}
          title="4K, 6K, then 8K"
          body="Premium downloads go to 6K and Premium+ to 8K, so the same scene keeps its detail on a 6K display or a Pro Display XDR."
        >
          <Resolution w={cast.resolution} />
        </Demo>

        <Demo
          flip
          tier={<Tier plus />}
          title="Cut for your screen"
          body="Each wallpaper is reframed per shape — desktop, tablet, phone — instead of one crop stretched to fit them all."
        >
          <Screens w={cast.screens} />
        </Demo>

        <Demo
          tier={<Tier plus />}
          title="Made to span displays"
          body="Multi-monitor packs come pre-cut, so one picture runs across two or three screens without a seam in the wrong place."
        >
          <MultiMonitor w={cast.panorama} />
        </Demo>

        <Demo
          flip
          tier={<Tier plus />}
          title="Wallpapers that move"
          body="Live wallpapers drift slowly behind your icons: enough to feel alive on wake, never enough to pull your eye."
        >
          <Live w={cast.live} />
        </Demo>

        <Demo
          tier={<Tier plus />}
          title="A wallpaper that follows the sun"
          body="Dynamic wallpapers shift with your clock — bright through the morning, warm at golden hour, dark after sunset."
        >
          <DayNight w={cast.daynight} />
        </Demo>

        <Demo
          flip
          tier={<Tier plus />}
          title="Exclusive series"
          body="Whole sets built around one subject — games, cars, anime, movies — with a new drop every month."
        >
          <Series cast={cast} />
        </Demo>

        <Demo
          tier={<Tier plus />}
          title="Ask for the one you want"
          body="Premium+ members can request a wallpaper. Describe the scene and the ratio, and it gets made and added to your library."
        >
          <Request w={cast.custom} />
        </Demo>
      </div>
    </section>
  );
}
