"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { DemoPlayer } from "../DemoPlayer";

export type Chapter = {
  id: string;
  /** Plain text, for labels a screen reader announces. */
  name: string;
  tier: React.ReactNode;
  title: React.ReactNode;
  /** A second, smaller headline under the title. */
  subtitle?: React.ReactNode;
  line: React.ReactNode;
  /** Seconds before the demonstration plays again; omit for one that already runs forever. */
  loop?: number;
  demo: React.ReactNode;
  /** Height over width of the demo at its design width, so it can be fitted to the screen. */
  ratio: number;
  /** Draw the demo this much larger than the room it is given, on a wide screen; for the widest ones. */
  grow?: number;
  /** A picture from the chapter, blurred into the canvas behind it. */
  ambient: string;
};

/** Every demo is laid out at this width and then zoomed to fit, so its small labels scale with it.
 *  Phones lay it out narrower, so it is zoomed down less and its labels stay legible. */
const DESIGN_W = 560;
const DESIGN_W_PHONE = 360;
const DESKTOP = "(min-width: 1024px)";
/** A finger has to travel this far (px) before letting go moves to another chapter. */
const SWIPE_PX = 36;

/** Scroll, as a share of the viewport, that carries the story from one chapter to the next. */
const SEG = 0.95;

/** Height of the site toolbar the stage pins under. */
const TOOLBAR = 52;

/** How long the glide from one chapter to the next takes. */
const GLIDE_MS = 720;
/** Wheel events closer together than this belong to the same gesture. */
const GESTURE_GAP_MS = 180;
/** The longer glide out of the last chapter to whatever the page marks as next. */
const EXIT_MS = 1100;
/** Room left above that next block once the glide has brought it up under the toolbar. */
const EXIT_GAP = 28;

const pad = (n: number) => String(n).padStart(2, "0");
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * The premium features as full-screen chapters on one continuous canvas.
 *
 * On a wide screen a stage pins under the toolbar for the length of the section, and the scroll
 * position becomes a single number — how far through the seven chapters the reader is. Every layer
 * reads its own distance from that number (`--t`, −1 before, 0 on, +1 past) and its visibility
 * (`--v`): a chapter arrives small, low and soft, settles, then carries on toward the camera and
 * blurs away as the next one arrives. The words move faster than the picture, which is the
 * parallax, and the blurred wallpaper behind everything crossfades with them, so the canvas itself
 * changes colour from chapter to chapter.
 *
 * All of that is written straight onto the nodes each frame; React only re-renders when the
 * chapter on stage changes, which is also what starts that chapter's demonstration.
 *
 * Phones get the same stage, stacked the other way: the words across the top, the demonstration
 * under them, the chapter stops as dots along the bottom. A swipe there works like a wheel gesture
 * on desktop: the page follows the finger, and letting go glides to the next chapter or back.
 */
export function Chapters({ chapters }: { chapters: Chapter[] }) {
  const n = chapters.length;
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ambientRefs = useRef<(HTMLDivElement | null)[]>([]);
  const railRef = useRef<HTMLDivElement>(null);
  const exitRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [onScreen, setOnScreen] = useState(false);
  const [mounted, setMounted] = useState(() => new Set([0, 1]));

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const paint = () => {
      frame = 0;
      const track = trackRef.current;
      if (!track) return;
      const seg = window.innerHeight * SEG;
      const top = track.getBoundingClientRect().top;
      // A quarter of a chapter of stillness at each end, so the first and last are not rushed.
      const p = clamp((TOOLBAR - top) / seg - 0.25, 0, n - 1);

      layerRefs.current.forEach((el, i) => {
        if (!el) return;
        const t = clamp(p - i, -1, 1);
        // Fully present for the middle of its stretch, and still a quarter there at the handover,
        // so the outgoing and incoming chapters overlap instead of leaving an empty beat between.
        const v = clamp(1 - (Math.abs(t) - 0.2) / 0.4, 0, 1);
        el.style.setProperty("--t", reduce ? "0" : t.toFixed(4));
        el.style.setProperty("--v", v.toFixed(4));
        el.style.visibility = v > 0 ? "visible" : "hidden";
        const amb = ambientRefs.current[i];
        if (amb) amb.style.opacity = v.toFixed(4);
      });
      railRef.current?.style.setProperty("--p", (p / (n - 1)).toFixed(4));
      // The hand-off to the page below shows only with the last chapter on stage.
      if (exitRef.current) exitRef.current.style.opacity = clamp(p - (n - 2), 0, 1).toFixed(4);

      setActive(Math.round(p));
      const box = stageRef.current?.getBoundingClientRect();
      setOnScreen(!!box && box.bottom > 0 && box.top < window.innerHeight);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    // The room the demos have, turned into two zoom limits each chapter picks the smaller of.
    const fit = () => {
      const area = areaRef.current;
      const stage = stageRef.current;
      if (!area || !stage) return;
      const dw = window.matchMedia(DESKTOP).matches ? DESIGN_W : DESIGN_W_PHONE;
      stage.style.setProperty("--dw", `${dw}px`);
      // `grow` is for the wide stage only; a phone has no room to spare.
      stage.style.setProperty("--wide", dw === DESIGN_W ? "1" : "0");
      stage.style.setProperty("--zw", (area.clientWidth / dw).toFixed(4));
      stage.style.setProperty("--zh", (area.clientHeight / dw).toFixed(4));
      schedule();
    };
    const ro = new ResizeObserver(fit);
    if (areaRef.current) ro.observe(areaRef.current);

    fit();
    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
    };
  }, [n]);

  // Mount the chapter on stage and its neighbours, and keep what has been mounted.
  useEffect(() => {
    setMounted((prev) => {
      const near = [active - 1, active, active + 1].filter((i) => i >= 0 && i < n);
      if (near.every((i) => prev.has(i))) return prev;
      return new Set([...prev, ...near]);
    });
  }, [active, n]);

  /** Where the page has to be scrolled to for chapter `i` to be on stage, at rest. */
  const restAt = (i: number) => {
    const track = trackRef.current;
    if (!track) return null;
    const seg = window.innerHeight * SEG;
    return track.getBoundingClientRect().top + window.scrollY - TOOLBAR + (i + 0.25) * seg;
  };

  const goTo = (i: number) => {
    const y = restAt(i);
    if (y !== null) glide.current(y);
  };

  // One wheel or trackpad gesture moves exactly one chapter. Free scrolling covered a chapter's
  // whole stretch in a flick and skipped the ones in between; here the section takes the gesture and
  // glides to the next rest position. The glide never holds the reader up: a new flick while it is
  // still moving re-aims it one chapter further, and only the trailing momentum of a flick is
  // ignored. At either end it lets go, so the page carries on scrolling normally above and below.
  const glide = useRef<(y: number, ms?: number) => void>(() => {});
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let busy = false;
    /** The chapter the running glide is heading for. */
    let aim = 0;
    let lastWheel = 0;
    let lastAbs = 0;
    let lastStep = 0;
    /** Set by the glide out of the section: the rest of that gesture's momentum is swallowed, so it
     *  cannot carry on past the next block and down the page. */
    let leaving = false;

    const stop = () => {
      cancelAnimationFrame(raf);
      busy = false;
    };

    /** Where the page marks the block after this section (`data-showcase-next`), if it does. */
    const exitY = () => {
      const next = document.querySelector<HTMLElement>("[data-showcase-next]");
      if (!next) return null;
      return next.getBoundingClientRect().top + window.scrollY - TOOLBAR - EXIT_GAP;
    };
    const leave = () => {
      const y = exitY();
      if (y === null) return false;
      leaving = true;
      glide.current(y, EXIT_MS);
      aim = n; // past the last chapter
      return true;
    };

    glide.current = (target: number, ms = GLIDE_MS) => {
      cancelAnimationFrame(raf);
      const first = restAt(0);
      if (first !== null) aim = Math.round((target - first) / (window.innerHeight * SEG));
      if (reduce) {
        window.scrollTo({ top: target, behavior: "instant" });
        return;
      }
      const from = window.scrollY;
      const start = performance.now();
      busy = true;
      const step = (now: number) => {
        const k = Math.min(1, (now - start) / ms);
        // Ease out only: a re-aimed glide starts from speed, so it should not wind up again.
        const e = 1 - (1 - k) ** 3;
        window.scrollTo({ top: from + (target - from) * e, behavior: "instant" });
        if (k < 1) raf = requestAnimationFrame(step);
        else busy = false;
      };
      raf = requestAnimationFrame(step);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX) || !e.deltaY) return;
      const track = trackRef.current;
      if (!track) return;
      const seg = window.innerHeight * SEG;
      const first = restAt(0)!;
      const down = e.deltaY > 0;
      const now = performance.now();
      const abs = Math.abs(e.deltaY);
      // A new gesture starts after a pause, or — on a trackpad still coasting from the last flick —
      // as a sudden surge on top of momentum that should only be dying away.
      const fresh = now - lastWheel > GESTURE_GAP_MS || (abs > lastAbs * 1.8 + 6 && now - lastStep > 200);
      lastWheel = now;
      lastAbs = abs;

      if (leaving) {
        // Still the gesture that left the section: hold the page on the next block until it ends.
        if (!fresh && (busy || down)) {
          e.preventDefault();
          return;
        }
        leaving = false;
        if (busy) stop();
      }

      let target: number;
      if (busy) {
        target = aim + (down ? 1 : -1);
        if (target < 0 || target > n - 1) {
          // Past the last chapter a fresh flick glides on to the next block; past the first it lets
          // the page go. Momentum just waits for the glide.
          e.preventDefault();
          if (!fresh) return;
          if (target > n - 1 && aim === n - 1) {
            lastStep = now;
            if (leave()) return;
          }
          stop();
          return;
        }
      } else {
        // Where the reader is, in chapters: 0 = first chapter at rest, n - 1 = the last.
        const c = (window.scrollY - first) / seg;
        if (down) {
          if (c < -0.6 || c > n - 1 + 0.3) return; // above the section, or already past it
          if (c > n - 1 - 0.02) {
            // On the last chapter: the next flick glides to the block after the section rather than
            // letting its momentum fling the page past it. With nothing marked, the page just goes.
            if (exitY() === null) return;
            e.preventDefault();
            if (!fresh) return;
            lastStep = now;
            leave();
            return;
          }
          target = c < -0.02 ? 0 : Math.floor(c + 0.02) + 1;
        } else {
          if (c > n - 1 + 0.6 || c < 0.02) return;
          target = c > n - 1 + 0.02 ? n - 1 : Math.ceil(c - 0.02) - 1;
        }
      }

      e.preventDefault();
      if (!fresh) return;
      lastStep = now;
      glide.current(first + target * seg);
    };

    // Touch: inside the pinned stretch the page follows the finger, and letting go glides one
    // chapter on in the swipe's direction (or back, for a short one). Native momentum never gets
    // going there, so a fling cannot skip chapters. Before the first chapter, after the last, and
    // for sideways swipes, the page scrolls as usual.
    let touch: { x: number; y: number; scroll: number; base: number; first: number; seg: number; mode: "undecided" | "stage" | "page" } | null =
      null;
    const onTouchStart = (e: TouchEvent) => {
      touch = null;
      if (e.touches.length !== 1) return;
      const first = restAt(0);
      if (first === null) return;
      const seg = window.innerHeight * SEG;
      const c = (window.scrollY - first) / seg;
      if (c < -0.5 || c > n - 1 + 0.3) return;
      if (busy) stop(); // a finger catches a glide in progress
      leaving = false;
      const t = e.touches[0];
      touch = { x: t.clientX, y: t.clientY, scroll: window.scrollY, base: clamp(Math.round(c), 0, n - 1), first, seg, mode: "undecided" };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!touch || touch.mode === "page") return;
      const t = e.touches[0];
      const dx = t.clientX - touch.x;
      const dy = touch.y - t.clientY; // positive: scrolling down the page
      if (touch.mode === "undecided") {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        const c = (touch.scroll - touch.first) / touch.seg;
        const sideways = Math.abs(dx) > Math.abs(dy);
        // Off the top of the first chapter, or the bottom of the last with nowhere marked to go: the page's.
        const outTop = dy < 0 && c < 0.02;
        const outBottom = dy > 0 && c > n - 1 - 0.02 && exitY() === null;
        touch.mode = sideways || outTop || outBottom ? "page" : "stage";
        if (touch.mode === "page") return;
      }
      e.preventDefault();
      // Follow the finger, but only as far as the neighbouring chapters.
      const lo = touch.first + Math.max(0, touch.base - 1) * touch.seg;
      const hi = touch.first + Math.min(n - 1, touch.base + 1) * touch.seg;
      window.scrollTo({ top: clamp(touch.scroll + dy, Math.min(lo, touch.scroll), Math.max(hi, touch.scroll)), behavior: "instant" });
    };
    const onTouchEnd = (e: TouchEvent) => {
      const t0 = touch;
      touch = null;
      if (!t0 || t0.mode !== "stage") return;
      const dy = t0.y - e.changedTouches[0].clientY;
      const dir = dy > SWIPE_PX ? 1 : dy < -SWIPE_PX ? -1 : 0;
      const c = (t0.scroll - t0.first) / t0.seg;
      // From before the first chapter, any downward swipe lands on it.
      const target = c < -0.02 && dir > 0 ? 0 : t0.base + dir;
      if (target > n - 1) {
        if (!leave()) glide.current(t0.first + (n - 1) * t0.seg);
        return;
      }
      glide.current(t0.first + clamp(target, 0, n - 1) * t0.seg);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [n]);

  return (
    <>
      {/* The pinned stage. The track is as long as the story; the stage sticks inside it. */}
      <div
        ref={trackRef}
        className="relative"
        style={{ height: `calc(100svh - ${TOOLBAR}px + ${(n - 0.5) * SEG * 100}svh)` }}
      >
        <div
          ref={stageRef}
          className="sticky overflow-hidden"
          style={{ top: TOOLBAR, height: `calc(100svh - ${TOOLBAR}px)` }}
        >
          {/* The canvas: one sky, tinted by whichever chapter is on it. Feathered in at the top so,
           *  while the stage is still sliding up under the title, it has no edge. */}
          <div aria-hidden className="absolute inset-0 [mask-image:linear-gradient(180deg,transparent,black_22%)]">
            {chapters.map((c, i) => (
              <div
                key={c.id}
                ref={(el) => {
                  ambientRefs.current[i] = el;
                }}
                className="absolute inset-0"
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                {mounted.has(i) && (
                  <Image src={c.ambient} alt="" fill sizes="480px" className="scale-125 object-cover opacity-60 blur-[80px] saturate-[1.7]" />
                )}
              </div>
            ))}
            {/* The veil that keeps it a pale sky rather than a photograph: clearer through the middle,
             *  where the colour is, and milkier at the top and bottom edges. */}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(246_250_254/0.7)_0%,rgb(246_250_254/0.42)_46%,rgb(240_245_252/0.74)_100%)]" />
            {/* A soft light behind the device, so it stands in the colour rather than on it. */}
            <div className="absolute top-[64%] left-1/2 aspect-square w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full lg:top-1/2 lg:right-[10%] lg:left-auto lg:w-[52%] lg:translate-x-0 bg-[radial-gradient(closest-side,rgb(255_255_255/0.7),rgb(255_255_255/0))]" />
            {/* With the last chapter on stage the bottom of the sky cools toward the pricing sky's
             *  blue and then fades out into the page, so the section ends without an edge. */}
            <div
              ref={exitRef}
              className="absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(180deg,rgb(214_231_252/0)_0%,rgb(206_225_251/0.55)_45%,rgb(236_244_254/0.9)_78%,#fff_100%)]"
              style={{ opacity: 0 }}
            />
          </div>

          {chapters.map((c, i) => (
            <div
              key={c.id}
              ref={(el) => {
                layerRefs.current[i] = el;
              }}
              aria-hidden={i !== active}
              inert={i !== active}
              className="absolute inset-0"
              style={{ visibility: i === 0 ? "visible" : "hidden", "--v": i === 0 ? 1 : 0, "--t": 0 } as React.CSSProperties}
            >
              {/* The words: nearer the viewer than the picture, so they travel further. Across the top
               *  on a phone, down the left beside the picture on a wide screen. */}
              <div
                className="absolute inset-x-5 top-[7%] will-change-transform [translate:0_calc(var(--t)*-8svh)] sm:inset-x-8 lg:inset-x-auto lg:top-1/2 lg:left-[6%] lg:w-[30%] lg:max-w-[480px] lg:[translate:0_calc(-50%_+_var(--t)*-22svh)]"
                style={{ opacity: "var(--v)" }}
              >
                <div className="flex items-center gap-2.5 lg:gap-3">
                  <span className="text-[12px] font-semibold tracking-[0.08em] text-label-3 tabular-nums lg:text-[13px]">
                    {pad(i + 1)} <span className="text-label-3/60">/ {pad(n)}</span>
                  </span>
                  {c.tier}
                </div>
                <h3 className="mt-2.5 font-display text-[32px] leading-[1.02] font-bold tracking-[-0.034em] text-label sm:text-[44px] lg:mt-5 lg:text-[clamp(44px,4.6vw,78px)] lg:leading-[0.98] lg:tracking-[-0.038em]">
                  {c.title}
                </h3>
                {c.subtitle && (
                  <p className="mt-1.5 font-display text-[18px] leading-[1.15] font-semibold tracking-[-0.02em] text-label-2 sm:text-[22px] lg:mt-3 lg:text-[clamp(22px,2vw,32px)]">
                    {c.subtitle}
                  </p>
                )}
                <p className="mt-2 max-w-[34ch] text-[14.5px] leading-snug text-label-2 lg:mt-5 lg:max-w-[30ch] lg:text-[17px] lg:leading-relaxed">
                  {c.line}
                </p>
              </div>

              {/* The picture: arrives from below and far off, leaves past the camera. */}
              <div
                className="absolute inset-x-[3%] top-[33%] bottom-[9%] flex items-center justify-center will-change-transform lg:inset-x-auto lg:inset-y-0 lg:right-[8%] lg:left-[38%]"
                style={{
                  opacity: "var(--v)",
                  scale: "calc(1 + var(--t) * 0.14)",
                  translate: "0 calc(var(--t) * -9svh)",
                  filter: "blur(calc((1 - var(--v)) * 14px))",
                }}
              >
                <DemoPlayer
                  active={i === active && onScreen}
                  loop={c.loop}
                  className="opacity-0 transition-opacity duration-600 ease-(--ease-mac) data-on:opacity-100"
                >
                  <div
                    style={{ width: `var(--dw, ${DESIGN_W}px)`, zoom: `calc(min(var(--zw, 1), calc(var(--zh, 1) / ${c.ratio})) * (1 + ${(c.grow ?? 1) - 1} * var(--wide, 1)))` }}
                  >
                    {mounted.has(i) && c.demo}
                  </div>
                </DemoPlayer>
              </div>
            </div>
          ))}

          {/* The room a demo is allowed, measured once and handed to every chapter as zoom limits. */}
          <div ref={areaRef} aria-hidden className="pointer-events-none invisible absolute top-[35%] right-[4%] bottom-[11%] left-[4%] lg:top-[13%] lg:right-[6%] lg:bottom-[13%] lg:left-[41%]"
          />

          {/* Where in the story the reader is: a hairline that fills, and a stop per chapter. */}
          <nav
            aria-label="Premium features"
            className="absolute bottom-[2.5%] left-1/2 -translate-x-1/2 lg:top-1/2 lg:right-[2.2%] lg:bottom-auto lg:left-auto lg:translate-x-0 lg:-translate-y-1/2"
          >
            <div aria-hidden className="absolute inset-y-2 right-[5px] hidden w-px bg-label/10 lg:block">
              <div ref={railRef} style={{ scale: "1 var(--p, 0)" }} className="h-full origin-top bg-label/40" />
            </div>
            <ol className="relative flex items-center gap-1 lg:flex-col lg:items-end lg:gap-3">
              {chapters.map((c, i) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`${pad(i + 1)}: ${c.name}`}
                    aria-current={i === active ? "step" : undefined}
                    className="group flex items-center justify-end gap-2.5 p-1.5 lg:px-0 lg:py-0.5"
                  >
                    <span
                      // Named on hover only: a standing label would sit over the picture.
                      className={`hidden text-[11px] font-semibold tracking-[0.04em] opacity-0 lg:inline transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 ${
                        i === active ? "text-label-2" : "text-label-3"
                      }`}
                    >
                      {c.name}
                    </span>
                    <span
                      // A pill for the chapter on stage on a phone, where there is no hairline to fill.
                      className={`block h-[7px] rounded-full border transition-[background-color,border-color,width] duration-300 lg:size-[11px] ${
                        i === active ? "w-5 border-label/50 bg-label/50" : "w-[7px] border-label/20 bg-[#f4f8fd]"
                      }`}
                    />
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

    </>
  );
}
