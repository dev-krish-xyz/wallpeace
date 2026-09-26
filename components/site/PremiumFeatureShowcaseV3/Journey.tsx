"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { DemoPlayer } from "../DemoPlayer";
import { LiveVideo } from "../LiveVideo";

export type Shot = { src: string; alt: string; blur: string | null };

export type Feature = {
  id: string;
  /** Plain text, for labels a screen reader announces. */
  name: string;
  tier: React.ReactNode;
  title: React.ReactNode;
  line: string;
};

type Props = {
  /** The one wallpaper the whole story is told with. */
  thread: Shot;
  live: { webm: string | null; mp4: string | null; poster: string };
  dynamic: { day: Shot; sunset: Shot; night: Shot };
  series: { label: string; src: string }[];
  custom: Shot;
  /** The seven features, in story order. Chapter 0 is the wallpaper on its own. */
  features: Feature[];
  /** The request the last chapter types out. */
  request: string;
};

/** Scroll, as a share of the viewport, from one chapter to the next. */
const SEG = 0.9;
const TOOLBAR = 52;
/** How far past the last chapter the scroll runs. */
const TAIL = 0.45;

const pad = (n: number) => String(n).padStart(2, "0");
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);
/** 0 → 1 → 0 across [a, b], with a short fade at each end. */
const window01 = (u: number, a: number, b: number, fade = 0.05) =>
  clamp((u - a) / fade) * clamp((b - u) / fade);

/** Where the wallpaper is, and what is built around it, at rest in one chapter. */
type Pose = {
  cx: number;
  cy: number;
  w: number;
  h: number;
  r: number;
  /** 1 = the picture is one third of a panorama three displays wide. */
  pano: number;
  /** Dark bezel around the screen. */
  bez: number;
  /** MacBook wrist-rest edge. */
  base: number;
  /** Monitor stands. */
  stand: number;
  /** iPad and iPhone beside it. */
  devs: number;
  /** The two outer monitors. */
  sides: number;
  /** The series cards fanned behind it. */
  fan: number;
};

const NONE = { pano: 0, bez: 0, base: 0, stand: 0, devs: 0, sides: 0, fan: 0 };

/** The eight rest poses for a stage of W × H. */
function poses(W: number, H: number): Pose[] {
  const S = Math.min(W * 0.5, H * 0.58 * 1.6);
  const mac = (scale = 1, dx = 0): Pose => {
    const w = S * scale;
    return { ...NONE, cx: W / 2 + dx, cy: H * 0.44, w, h: w / 1.6, r: w * 0.012, bez: 1, base: 1 };
  };
  const m = Math.min(W * 0.25, H * 0.5 * (16 / 9));
  const card = S * 0.5;
  return [
    { ...NONE, cx: W / 2, cy: H / 2, w: W, h: H, r: 0 },
    mac(),
    { ...mac(0.8, -S * 0.26), devs: 1 },
    { ...NONE, cx: W / 2, cy: H * 0.44, w: m, h: (m * 9) / 16, r: 2, pano: 1, bez: 1, stand: 1, sides: 1 },
    mac(),
    mac(),
    { ...NONE, cx: W / 2, cy: H * 0.44, w: card, h: card / 1.6, r: card * 0.035, fan: 1 },
    mac(),
  ];
}

function blend(a: Pose, b: Pose, k: number): Pose {
  const out = { ...a };
  for (const key of Object.keys(a) as (keyof Pose)[]) out[key] = lerp(a[key], b[key], k);
  return out;
}

/** Where each series card settles, relative to the wallpaper at the centre of the fan. */
const FAN = [
  { x: -1.08, y: 0.1, r: -13 },
  { x: -0.56, y: 0.03, r: -6 },
  { x: 0.56, y: 0.03, r: 6 },
  { x: 1.08, y: 0.1, r: 13 },
];

const RES = [
  { label: "4K", px: "3840 × 2160" },
  { label: "6K", px: "6016 × 3384" },
  { label: "8K", px: "7680 × 4320" },
];

const FLOW = [
  { label: "Request", at: 0 },
  { label: "Creating", at: 0.32 },
  { label: "Finished", at: 0.62 },
  { label: "Added to library", at: 0.84 },
];

const PHASES = ["Day", "Sunset", "Night"];

/**
 * One wallpaper, carried through every feature.
 *
 * It opens filling the screen. Scrolling pulls the camera back until it is the screen of a MacBook,
 * and from there the same picture is pushed into (4K → 6K → 8K), set beside an iPad and an iPhone
 * that reframe it, stretched across three displays, woken up, walked from day to night, dealt into a
 * collection, and finally replaced by a wallpaper someone asked for. Nothing is swapped out between
 * chapters: the screen the reader is looking at is the same element the whole way down.
 *
 * The scroll position becomes one number, `p` (0 = the opening, 7 = the last chapter). Between two
 * chapters the scene eases from one rest pose to the next; within a chapter the feature's own effect
 * is scrubbed by the scroll — so scrolling slower zooms slower, and scrolling back runs the day
 * backwards. Every frame is written straight onto the nodes; React only re-renders when the chapter
 * changes, to mount media and start or stop the video.
 */
export function Journey({ thread, live, dynamic, series, custom, features, request }: Props) {
  const N = features.length + 1;
  const [active, setActive] = useState(0);
  const [onScreen, setOnScreen] = useState(false);
  const [mounted, setMounted] = useState(() => new Set([0, 1]));

  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const size = useRef({ W: 0, H: 0 });
  // Every node the frame loop writes to.
  const el = useRef<Record<string, HTMLElement | null>>({});
  const set = (key: string) => (node: HTMLElement | null) => {
    el.current[key] = node;
  };

  useEffect(() => {
    let frame = 0;
    let lastRes = -1;
    let lastTyped = -1;

    const paint = () => {
      frame = 0;
      const t = track.current;
      const { W, H } = size.current;
      if (!t || !t.offsetHeight || !W) return; // stacked layout: nothing to draw
      const e = el.current;
      const seg = window.innerHeight * SEG;
      // A quarter of a chapter of stillness before the first; after the last, room for its own
      // scrub to finish (it runs to p = last + 0.3) and a moment held on the result.
      const p = clamp((TOOLBAR - t.getBoundingClientRect().top) / seg - 0.25, 0, N - 1 + TAIL);

      // The last chapter never hands over, so it stays fully present past its centre.
      const vis = (j: number) => (j === N - 1 && p >= j ? 1 : clamp(1 - (Math.abs(p - j) - 0.3) / 0.2));
      const scrub = (j: number) => clamp((p - j + 0.3) / 0.6);

      // Rest pose → rest pose, in the middle 40% of the scroll between two chapters.
      const all = poses(W, H);
      const i = Math.min(Math.floor(p), N - 2);
      const k = ease(clamp((p - i - 0.3) / 0.4));
      const P = blend(all[i], all[i + 1], k);
      const b = P.w * 0.018 * P.bez;
      const left = P.cx - P.w / 2;
      const top = P.cy - P.h / 2;
      const bottom = P.cy + P.h / 2 + b;

      const hero = e.hero;
      if (hero) {
        hero.style.transform = `translate(${left}px, ${top}px)`;
        hero.style.width = `${P.w}px`;
        hero.style.height = `${P.h}px`;
        hero.style.borderRadius = `${P.r}px`;
      }

      // 01 — pushing into the picture while it resolves.
      const v1 = vis(1);
      const u1 = scrub(1);
      const zoom = 1 + 0.34 * ease(u1) * v1;
      const blur = v1 * 2.6 * (1 - u1) ** 1.6;
      // 03 — the panorama drifting, all three displays in step.
      const drift = 0.05 * scrub(3) * vis(3);
      const img = e.img;
      if (img) {
        img.style.width = `${(1 + 2 * P.pano) * 100}%`;
        img.style.left = `${(-P.pano - drift) * 100}%`;
        img.style.transform = zoom > 1.0005 ? `scale(${zoom})` : "";
        img.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "";
      }
      if (e.res) {
        e.res.style.opacity = v1.toFixed(3);
        const step = u1 < 0.34 ? 0 : u1 < 0.67 ? 1 : 2;
        if (step !== lastRes) {
          lastRes = step;
          e.res.innerHTML = `${RES[step].label}<span style="font-weight:400;opacity:.7;margin-left:.5em">${RES[step].px}</span>`;
        }
      }

      if (e.bezel) {
        e.bezel.style.opacity = P.bez.toFixed(3);
        e.bezel.style.transform = `translate(${left - b}px, ${top - b}px)`;
        e.bezel.style.width = `${P.w + 2 * b}px`;
        e.bezel.style.height = `${P.h + 2 * b}px`;
        e.bezel.style.borderRadius = `${P.r + b}px`;
      }
      if (e.base) {
        const bw = (P.w + 2 * b) * 1.08;
        e.base.style.opacity = P.base.toFixed(3);
        e.base.style.transform = `translate(${P.cx - bw / 2}px, ${bottom}px)`;
        e.base.style.width = `${bw}px`;
        e.base.style.height = `${Math.max(3, P.w * 0.014)}px`;
      }

      // 03 — the outer displays slide in from off to each side and pick up their thirds.
      const gap = P.w * 0.035;
      [-1, 0, 1].forEach((dir) => {
        const stand = e[`stand${dir}`];
        const x = P.cx + dir * (P.w + 2 * b + gap + (1 - P.sides) * P.w * 0.4);
        const o = dir === 0 ? P.stand : P.stand * P.sides;
        if (stand) {
          stand.style.opacity = o.toFixed(3);
          stand.style.visibility = o > 0.001 ? "visible" : "hidden";
          stand.style.transform = `translate(${x - P.w / 2}px, ${bottom}px)`;
          stand.style.width = `${P.w}px`;
          stand.style.height = `${P.w * 0.06}px`;
        }
        if (dir === 0) return;
        const side = e[`side${dir}`];
        const pic = e[`sideImg${dir}`];
        if (side) {
          side.style.opacity = P.sides.toFixed(3);
          side.style.visibility = P.sides > 0.001 ? "visible" : "hidden";
          side.style.transform = `translate(${x - P.w / 2 - b}px, ${top - b}px)`;
          side.style.width = `${P.w + 2 * b}px`;
          side.style.height = `${P.h + 2 * b}px`;
          side.style.padding = `${b}px`;
          side.style.borderRadius = `${P.r + b}px`;
        }
        if (pic) pic.style.left = `${(-(dir + 1) - drift) * 100}%`;
      });

      // 02 — an iPad and an iPhone beside the MacBook, each reframing the same scene.
      const devices: [string, number, number][] = [
        ["ipad", 0.36, 4 / 3],
        ["iphone", 0.17, 19.5 / 9],
      ];
      let x = P.cx + P.w / 2 + b + P.w * 0.07 + (1 - P.devs) * P.w * 0.3;
      devices.forEach(([key, scale, ratio]) => {
        const d = e[key];
        if (!d) return;
        const w = P.w * scale;
        const h = w * ratio;
        const pb = w * (key === "ipad" ? 0.03 : 0.045);
        d.style.opacity = P.devs.toFixed(3);
        d.style.visibility = P.devs > 0.001 ? "visible" : "hidden";
        d.style.transform = `translate(${x}px, ${bottom - h - 2 * pb}px)`;
        d.style.width = `${w + 2 * pb}px`;
        d.style.height = `${h + 2 * pb}px`;
        d.style.padding = `${pb}px`;
        d.style.borderRadius = `${w * (key === "ipad" ? 0.08 : 0.17)}px`;
        x += w + 2 * pb + P.w * 0.05;
      });

      // 06 — the collection fanning out from behind the wallpaper.
      const spread = P.fan * (0.86 + 0.14 * scrub(6));
      FAN.forEach((f, j) => {
        const c = e[`card${j}`];
        if (!c) return;
        c.style.opacity = P.fan.toFixed(3);
        c.style.visibility = P.fan > 0.001 ? "visible" : "hidden";
        c.style.width = `${P.w}px`;
        c.style.height = `${P.h}px`;
        c.style.borderRadius = `${P.r}px`;
        c.style.transform = `translate(${left + f.x * P.w * spread}px, ${top + f.y * P.h * spread}px) rotate(${f.r * spread}deg)`;
      });
      if (e.cardLabels) e.cardLabels.style.opacity = vis(6).toFixed(3);

      // 04 — the wallpaper waking up.
      if (e.live) e.live.style.opacity = vis(4).toFixed(3);

      // 05 — the day walked through to night by the scroll itself.
      const v5 = vis(5);
      const u5 = scrub(5);
      if (e.dyn) e.dyn.style.opacity = v5.toFixed(3);
      if (e.sunset) e.sunset.style.opacity = ease(clamp((u5 - 0.22) / 0.2)).toFixed(3);
      if (e.night) e.night.style.opacity = ease(clamp((u5 - 0.58) / 0.2)).toFixed(3);
      const under = `translate(${P.cx}px, ${bottom + Math.max(3, P.w * 0.014) + 26}px) translateX(-50%)`;
      if (e.timeline) {
        e.timeline.style.opacity = v5.toFixed(3);
        e.timeline.style.transform = under;
        e.timeline.style.width = `${P.w * 0.8}px`;
      }
      if (e.fill) e.fill.style.transform = `scaleX(${u5.toFixed(4)})`;
      const phase = u5 < 0.36 ? 0 : u5 < 0.72 ? 1 : 2;
      PHASES.forEach((_, j) => {
        const l = e[`phase${j}`];
        if (l) l.style.opacity = j === phase ? "1" : "0.35";
      });

      // 07 — a request, made, and landing on the screen.
      const v7 = vis(7);
      const u7 = scrub(7);
      const wipe = ease(clamp((u7 - 0.62) / 0.18));
      if (e.req) e.req.style.opacity = v7.toFixed(3);
      if (e.blank) e.blank.style.opacity = (1 - wipe).toFixed(3);
      if (e.customImg) e.customImg.style.clipPath = `inset(0 ${((1 - wipe) * 100).toFixed(2)}% 0 0)`;
      if (e.ask) e.ask.style.opacity = window01(u7, 0, 0.32).toFixed(3);
      const typed = Math.round(clamp(u7 / 0.24) * request.length);
      if (e.typed && typed !== lastTyped) {
        lastTyped = typed;
        e.typed.textContent = request.slice(0, typed);
      }
      if (e.making) e.making.style.opacity = window01(u7, 0.32, 0.62).toFixed(3);
      if (e.bar) e.bar.style.transform = `scaleX(${clamp((u7 - 0.34) / 0.24).toFixed(4)})`;
      if (e.added) e.added.style.opacity = clamp((u7 - 0.84) / 0.08).toFixed(3);
      if (e.flow) {
        e.flow.style.opacity = v7.toFixed(3);
        e.flow.style.transform = under;
      }
      FLOW.forEach((f, j) => {
        const s = e[`flow${j}`];
        if (s) s.style.opacity = u7 >= f.at ? "1" : "0.35";
      });

      // The words: the opening title over the full-bleed picture, then one line per chapter.
      const v0 = vis(0);
      if (e.intro) {
        e.intro.style.opacity = v0.toFixed(3);
        e.intro.style.transform = `translateY(${(-p * 90).toFixed(1)}px)`;
      }
      if (e.scrim) e.scrim.style.opacity = v0.toFixed(3);
      for (let j = 1; j < N; j++) {
        const words = e[`words${j}`];
        if (!words) continue;
        const v = vis(j);
        words.style.opacity = v.toFixed(3);
        words.style.visibility = v > 0 ? "visible" : "hidden";
        words.style.transform = `translateY(${((j - p) * 70).toFixed(1)}px)`;
      }
      if (e.rail) e.rail.style.setProperty("--p", clamp((p - 1) / (N - 2)).toFixed(4));
      // The rail belongs to the features; the opening picture has the screen to itself.
      if (e.nav) e.nav.style.opacity = (1 - v0).toFixed(3);

      setActive(Math.min(N - 1, Math.round(p)));
      const box = stage.current?.getBoundingClientRect();
      setOnScreen(!!box && box.bottom > 0 && box.top < window.innerHeight);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const ro = new ResizeObserver(() => {
      const s = stage.current;
      if (s) size.current = { W: s.clientWidth, H: s.clientHeight };
      schedule();
    });
    if (stage.current) ro.observe(stage.current);
    window.addEventListener("scroll", schedule, { passive: true });
    schedule();
    return () => {
      if (frame) cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
    };
  }, [N, request]);

  useEffect(() => {
    setMounted((prev) => {
      const near = [active - 1, active, active + 1].filter((i) => i >= 0 && i < N);
      if (near.every((i) => prev.has(i))) return prev;
      return new Set([...prev, ...near]);
    });
  }, [active, N]);

  const goTo = (chapter: number) => {
    const t = track.current;
    if (!t) return;
    const seg = window.innerHeight * SEG;
    const top = t.getBoundingClientRect().top + window.scrollY;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: top - TOOLBAR + (chapter + 0.25) * seg, behavior: reduce ? "auto" : "smooth" });
  };

  // Absolute, top-left anchored, moved by transform: the frame loop owns every one of these.
  const placed = "absolute top-0 left-0 will-change-transform";
  const picture = (s: Shot, sizes: string, className = "object-cover") => (
    <Image
      src={s.src}
      alt={s.alt}
      fill
      sizes={sizes}
      placeholder={s.blur ? "blur" : "empty"}
      blurDataURL={s.blur ?? undefined}
      className={className}
    />
  );
  const readout =
    "rounded-[5px] bg-black/45 px-1.5 py-px text-[10px] font-semibold tracking-[0.02em] text-white/95 backdrop-blur-sm lg:text-[11px]";

  return (
    <div
      ref={track}
      className="relative hidden lg:motion-safe:block"
      style={{ height: `calc(100svh - ${TOOLBAR}px + ${(N - 1 + TAIL + 0.5) * SEG * 100}svh)` }}
    >
      <div ref={stage} className="sticky overflow-hidden" style={{ top: TOOLBAR, height: `calc(100svh - ${TOOLBAR}px)` }}>
        {/* The canvas: the wallpaper itself, blurred to a sky, under everything. */}
        <div aria-hidden className="absolute inset-0 bg-[#eef3fa]">
          <Image src={thread.src} alt="" fill sizes="480px" className="scale-125 object-cover opacity-55 blur-[90px] saturate-150" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(246_250_254/0.62)_0%,rgb(246_250_254/0.5)_50%,rgb(240_245_252/0.78)_100%)]" />
        </div>

        {/* Behind the wallpaper: the collection it is dealt into. */}
        {series.map((s, j) => (
          <div
            key={s.label}
            ref={set(`card${j}`)}
            className={`${placed} invisible overflow-hidden bg-fill shadow-[0_24px_60px_-24px_rgb(12_38_90/0.45)]`}
            style={{ zIndex: j === 0 || j === 3 ? 1 : 2, transformOrigin: "50% 80%" }}
          >
            {mounted.has(6) && <Image src={s.src} alt={`${s.label} series wallpaper`} fill sizes="(min-width: 1024px) 460px, 40vw" className="object-cover" />}
          </div>
        ))}
        <div ref={set("cardLabels")} aria-hidden className="pointer-events-none absolute inset-x-0 top-[76%] flex justify-center gap-3 opacity-0">
          {series.map((s) => (
            <span key={s.label} className="rounded-full bg-white/70 px-3 py-1 text-[12px] font-semibold text-label-2 ring-1 ring-white/80 backdrop-blur-sm">
              {s.label}
            </span>
          ))}
        </div>

        {/* Devices around the wallpaper. */}
        <div ref={set("bezel")} aria-hidden className={`${placed} bg-[#1d1d1f] opacity-0 shadow-[0_30px_70px_-30px_rgb(12_38_90/0.5)]`} />
        <div ref={set("base")} aria-hidden className={`${placed} rounded-b-[6px] bg-[linear-gradient(180deg,#d6d8db,#b9bbbf)] opacity-0`} />
        {[-1, 0, 1].map((dir) => (
          <div key={dir} ref={set(`stand${dir}`)} aria-hidden className={`${placed} invisible flex flex-col items-center`}>
            <div className="h-[70%] w-[13%] bg-[#c8cacd]" />
            <div className="h-[30%] w-[34%] rounded-[2px] bg-[#c8cacd]" />
          </div>
        ))}
        {[-1, 1].map((dir) => (
          <div key={dir} ref={set(`side${dir}`)} aria-hidden className={`${placed} invisible bg-[#1d1d1f] shadow-[0_24px_50px_-26px_rgb(12_38_90/0.5)]`}>
            <div className="relative size-full overflow-hidden rounded-[2px] bg-fill">
              <div ref={set(`sideImg${dir}`)} className="absolute inset-y-0 w-[300%]">
                {picture(thread, "(min-width: 1024px) 1200px, 100vw", "object-cover object-[50%_42%]")}
              </div>
            </div>
          </div>
        ))}
        {(
          [
            ["ipad", "46% 42%"],
            ["iphone", "52% 46%"],
          ] as const
        ).map(([key, position]) => (
          <div key={key} ref={set(key)} aria-hidden className={`${placed} invisible bg-[#1d1d1f] shadow-[0_24px_50px_-26px_rgb(12_38_90/0.5)]`}>
            <div className={`relative size-full overflow-hidden bg-fill ${key === "ipad" ? "rounded-[6%]" : "rounded-[14%/7%]"}`}>
              <Image src={thread.src} alt="" fill sizes="320px" style={{ objectPosition: position }} className="object-cover" />
            </div>
          </div>
        ))}

        {/* The wallpaper. Everything above is arranged around this one element. */}
        <div ref={set("hero")} className={`${placed} z-10 overflow-hidden bg-fill`}>
          <div ref={set("img")} className="absolute inset-y-0 left-0 w-full origin-center">
            {picture(thread, "100vw", "object-cover object-[50%_42%]")}
          </div>

          {/* 01 */}
          <span ref={set("res")} className={`absolute bottom-[5%] left-[3.5%] opacity-0 ${readout}`} />

          {/* 04 — the uploaded video, or until then the still with a slow drift. */}
          <div ref={set("live")} className="absolute inset-0 opacity-0">
            <DemoPlayer active={active === 4 && onScreen} className="absolute inset-0">
              {mounted.has(4) &&
                (live.webm || live.mp4 ? (
                  <LiveVideo webm={live.webm} mp4={live.mp4} poster={live.poster} alt={thread.alt} />
                ) : (
                  <Image src={live.poster} alt="" fill sizes="100vw" className="object-cover [animation:drift_18s_ease-in-out_infinite_alternate]" />
                ))}
              <span className="absolute top-[5%] left-[3.5%] inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2 py-px text-[10px] font-semibold tracking-[0.06em] text-white/95 backdrop-blur-sm lg:text-[11px]">
                <span className="size-1.5 rounded-full bg-[#ff453a] motion-safe:animate-pulse" />
                LIVE
              </span>
            </DemoPlayer>
          </div>

          {/* 05 — the three states, stacked; the scroll decides how far through the day it is. */}
          <div ref={set("dyn")} className="absolute inset-0 opacity-0">
            {mounted.has(5) && (
              <>
                {picture(dynamic.day, "100vw")}
                <div ref={set("sunset")} className="absolute inset-0 opacity-0">
                  {picture(dynamic.sunset, "100vw")}
                </div>
                <div ref={set("night")} className="absolute inset-0 opacity-0">
                  {picture(dynamic.night, "100vw")}
                </div>
              </>
            )}
          </div>

          {/* 07 — an empty screen, the request, the making of it, the result wiping in. */}
          <div ref={set("req")} className="absolute inset-0 opacity-0">
            <div ref={set("blank")} className="absolute inset-0 bg-[#e9edf3]" />
            <div ref={set("customImg")} className="absolute inset-0" style={{ clipPath: "inset(0 100% 0 0)" }}>
              {mounted.has(7) && picture(custom, "100vw")}
            </div>
            <div className="absolute inset-x-0 top-[16%] grid justify-items-center px-[14%]">
              <div ref={set("ask")} className="col-start-1 row-start-1 w-full max-w-[340px] rounded-[12px] bg-surface p-4 opacity-0 shadow-card-hover">
                <p className="text-[11px] font-semibold text-label-3">Your request</p>
                <p className="mt-1 min-h-[3em] text-[13px] leading-relaxed text-label">
                  <span ref={set("typed")} />
                  <span className="ml-0.5 inline-block w-px translate-y-0.5 border-l border-label text-transparent [animation:caret_1.1s_steps(1)_infinite]">
                    |
                  </span>
                </p>
              </div>
              <div ref={set("making")} className="col-start-1 row-start-1 w-full max-w-[340px] rounded-[12px] bg-surface p-4 opacity-0 shadow-card-hover">
                <p className="text-[11px] font-semibold text-label-3">Creating</p>
                <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-fill-2">
                  <div ref={set("bar")} className="h-full w-full origin-left scale-x-0 rounded-full bg-premium" />
                </div>
              </div>
            </div>
            <span ref={set("added")} className={`absolute bottom-[5%] left-[3.5%] opacity-0 ${readout}`}>
              Added to your library
            </span>
          </div>

          {/* The dark wash that keeps the opening title legible over the picture. */}
          <div ref={set("scrim")} aria-hidden className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_50%,rgb(0_0_0/0.34),rgb(0_0_0/0.12))]" />
        </div>

        {/* Under the device: the day's timeline, and where the request is. */}
        <div ref={set("timeline")} aria-hidden className={`${placed} z-10 opacity-0`}>
          <div className="h-px w-full bg-label/15">
            <div ref={set("fill")} className="h-full w-full origin-left scale-x-0 bg-label/50" />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] font-semibold tracking-[0.14em] text-label-2">
            {PHASES.map((ph, j) => (
              <span key={ph} className="contents">
                <span ref={set(`phase${j}`)} className="transition-opacity duration-300">
                  {ph.toUpperCase()}
                </span>
                {j < PHASES.length - 1 && <span className="text-label-3/60">→</span>}
              </span>
            ))}
          </div>
        </div>
        <div ref={set("flow")} aria-hidden className={`${placed} z-10 flex items-center gap-2.5 whitespace-nowrap text-[12px] font-semibold text-label-2 opacity-0`}>
          {FLOW.map((f, j) => (
            <span key={f.label} className="contents">
              <span ref={set(`flow${j}`)} className="inline-flex items-center gap-1.5 opacity-35 transition-opacity duration-300">
                <span className="size-1.5 rounded-full bg-premium" />
                {f.label}
              </span>
              {j < FLOW.length - 1 && <span className="text-label-3/60">→</span>}
            </span>
          ))}
        </div>

        {/* The opening title, over the full-bleed wallpaper. */}
        <div ref={set("intro")} className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white">
          <span className="rounded-full bg-white/20 px-3 py-1 text-[12px] font-semibold ring-1 ring-white/40 backdrop-blur-md">Premium</span>
          <h2 id="showcase-v3-title" className="mt-6 font-display text-[clamp(56px,7vw,112px)] leading-[0.95] font-bold tracking-[-0.045em] [text-shadow:0_2px_30px_rgb(0_0_0/0.25)]">
            What Premium adds
          </h2>
          <p className="mt-5 text-[19px] text-white/85">More ways to make your screen yours.</p>
          <p className="mt-16 text-[11px] font-semibold tracking-[0.2em] text-white/60">SCROLL</p>
        </div>

        {/* One line per chapter, low on the left, out of the picture's way. */}
        {features.map((f, idx) => {
          const j = idx + 1;
          return (
            <div
              key={f.id}
              ref={set(`words${j}`)}
              aria-hidden={active !== j}
              className="invisible absolute bottom-[7%] left-[5%] z-20 max-w-[26rem] opacity-0"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-[12px] font-semibold tracking-[0.08em] text-label-3 tabular-nums">{pad(j)}</span>
                {f.tier}
              </div>
              <h3 className="mt-2 font-display text-[clamp(30px,2.8vw,44px)] leading-[1.02] font-bold tracking-[-0.035em] text-label">{f.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-label-2">{f.line}</p>
            </div>
          );
        })}

        {/* Where the reader is in the story, and a way to jump. */}
        <nav ref={set("nav")} aria-label="Premium features" className="absolute top-1/2 right-[2.2%] z-20 -translate-y-1/2 opacity-0">
          <div aria-hidden className="absolute inset-y-2 right-[5px] w-px bg-label/10">
            <div ref={set("rail")} style={{ scale: "1 clamp(0, var(--p, 0), 1)" }} className="h-full origin-top bg-label/40" />
          </div>
          <ol className="relative flex flex-col items-end gap-3">
            {features.map((f, idx) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => goTo(idx + 1)}
                  aria-label={`${pad(idx + 1)}: ${f.name}`}
                  aria-current={active === idx + 1 ? "step" : undefined}
                  className="group flex items-center gap-2.5 py-0.5"
                >
                  <span className="text-[11px] font-semibold text-label-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    {f.name}
                  </span>
                  <span
                    className={`block size-[11px] rounded-full border transition-[background-color,border-color] duration-300 ${
                      active === idx + 1 ? "border-label/50 bg-label/50" : "border-label/20 bg-[#f4f8fd]"
                    }`}
                  />
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
}

/** For the stacked layout: plays once most of it is on screen, rewinds once it has gone. */
export function InView({ loop, children }: { loop?: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.35) setActive(true);
        else if (!entry.isIntersecting) setActive(false);
      },
      { threshold: [0, 0.35] },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref}>
      <DemoPlayer
        active={active}
        loop={loop}
        className="translate-y-4 opacity-0 transition-[opacity,translate] duration-600 ease-(--ease-mac) data-on:translate-y-0 data-on:opacity-100"
      >
        {children}
      </DemoPlayer>
    </div>
  );
}
