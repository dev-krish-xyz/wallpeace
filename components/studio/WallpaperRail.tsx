"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "@/components/ui/icons";
import { displayTitle } from "@/lib/format";
import { displayUrl } from "@/lib/storage";
import type { Wallpaper } from "@/types/database";
import { armTicks, tick } from "./tick";

// ─── Drum geometry ───────────────────────────────────────────────────────────
// Angle between neighbors on the drum. Smaller = bigger ring, flatter curve.
const STEP = (34 * Math.PI) / 180;
const MAX_ANGLE = Math.PI / 2;
// Orb: while you turn the carousel, cards ride the surface of a cylinder (true circular path,
// tilting with the surface). At rest the orb relaxes into a flat stack of same-size cards.
const ORB_TILT = 0.85; // 1 = card lies exactly on the surface; a touch less keeps faces readable
const ORB_HOLD_MS = 220; // keep the orb engaged this long after the last wheel event
const ORB_IN_RATE = 45; // how fast the orb forms when you start turning (~3 frames)
const ORB_OUT_RATE = 4.5; // how gently it relaxes back to flat when you stop
// A card counts as arrived (sharpens and glows) within this fraction of a card from the center.
const LOCK_DISTANCE = 0.03;
const GAP = 16;
const REST_GAP = 36; // gap between flat cards at rest
// Depth-of-field blur by distance from the selected card, eased by CSS when the selection changes.
const BLUR_BY_DISTANCE = [0, 1.75, 3.5];

// ─── Motion ──────────────────────────────────────────────────────────────────
// How quickly the ring eases toward its target (higher = snappier).
const EASE_RATE = 11;
// Wheel travel (px) that counts as one step. After a step the wheel locks until the gesture
// (including trackpad momentum) goes quiet, or a new swipe starts while momentum is decaying.
const WHEEL_STEP = 40;
const WHEEL_IDLE_MS = 180;
const REACCELERATION = 1.6;
// Drag distance (px) before a press becomes a drag instead of a click.
const DRAG_SLOP = 6;
// How far a flick carries (ms of velocity projected forward) when it isn't thrown hard enough to glide.
const FLICK_MS = 140;
// Touch fling: a hard swipe keeps travelling and slows down, instead of stopping at the next card.
// Velocity comes from the last FLING_SAMPLE_MS of the gesture, in cards per second.
const FLING_SAMPLE_MS = 90;
const FLING_MIN_SPEED = 1.6; // below this a release just settles on the nearest card
const FLING_FRICTION = 3.6; // e-folds per second; higher stops sooner
const FLING_STOP_SPEED = 0.7; // hand back to the snap easing below this
const FLING_MAX_SPEED = 26;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const DESKTOP = "(min-width: 1024px)";

/**
 * Drum carousel driven by a single `position` (in cards), not by native scrolling: the centered
 * card is active; neighbors wrap around a ring, tilting back and dimming with distance. Wheel and
 * arrows step one card at a time; drag follows the pointer and settles on the nearest card.
 * Vertical in the desktop sidebar, horizontal on small screens.
 */
export function WallpaperRail({
  wallpapers,
  selectedId,
  onSelect,
  onPreload,
}: {
  wallpapers: Wallpaper[];
  selectedId: string;
  onSelect: (w: Wallpaper) => void;
  onPreload: (w: Wallpaper) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lastStyles = useRef<string[]>([]);
  const selectedIndex = Math.max(0, wallpapers.findIndex((w) => w.id === selectedId));
  const count = wallpapers.length;

  // The card the ring has come to rest on. Blur and shadow follow this, not each step, so fast
  // scrolling never restarts filter transitions mid-motion.
  const [restingIndex, setRestingIndex] = useState(selectedIndex);
  const position = useRef(selectedIndex); // what's drawn, fractional while moving
  const target = useRef(selectedIndex); // where it's heading, always a whole card
  const raf = useRef(0);
  const lastTime = useRef(0);
  const drag = useRef<{ id: number; start: number; startPos: number; moved: boolean; samples: { t: number; v: number }[] } | null>(null);
  const suppressClick = useRef(false);
  const wheel = useRef({ acc: 0, lastEvent: 0, lastAbs: 0, locked: false });
  const fling = useRef(0); // cards per second while a swipe is still gliding, 0 when it isn't

  // Latest props for event handlers without re-subscribing.
  const latest = useRef({ wallpapers, onSelect, onPreload, selectedIndex });
  latest.current = { wallpapers, onSelect, onPreload, selectedIndex };

  const isVertical = () => typeof window !== "undefined" && window.matchMedia(DESKTOP).matches;

  const tickedIndex = useRef(-1);
  const orbLevel = useRef(0); // 0 = flat resting stack, 1 = full orb
  const lockedIndex = useRef(-1); // last card handed to setRestingIndex
  useEffect(() => armTicks(), []);

  /** Draws every card from `position`. Only transform/opacity change per frame. */
  const paint = useCallback(() => {
    const stage = stageRef.current;
    const first = cardRefs.current.find(Boolean);
    if (!stage || !first) return;
    const vertical = isVertical();
    const pitch = (vertical ? first.offsetHeight : first.offsetWidth) + GAP;
    const radius = pitch / STEP;
    const restPitch = pitch - GAP + REST_GAP;
    const level = orbLevel.current;
    const orb = level * level * (3 - 2 * level); // smoothstep: eases in and out of the orb

    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const s = i - position.current;
      const angle = clamp(s * STEP, -MAX_ANGLE, MAX_ANGLE);
      // Blend the flat resting layout into the true orb (circle of `radius`).
      const flat = s * restPitch;
      const along = (flat + (radius * Math.sin(angle) - flat) * orb).toFixed(2);
      const depth = (radius * (Math.cos(angle) - 1) * orb).toFixed(2);
      const tilt = (-angle * ORB_TILT * orb * 180) / Math.PI;
      const facing = Math.cos(angle);
      const transform = vertical
        ? `translate(-50%,-50%) translate3d(0,${along}px,${depth}px) rotateX(${tilt.toFixed(2)}deg)`
        : `translate(-50%,-50%) translate3d(${along}px,0,${depth}px) rotateY(${(-tilt).toFixed(2)}deg)`;
      const opacity = Math.max(0, (facing - 0.1) / 0.9).toFixed(3);
      const shade = ((1 - facing) * 0.55).toFixed(3);
      const zIndex = String(100 - Math.round(Math.abs(s) * 4));
      const hidden = Math.abs(s) > 2.6;

      const key = `${transform}|${opacity}|${shade}|${zIndex}|${hidden}`;
      if (lastStyles.current[i] === key) return;
      lastStyles.current[i] = key;
      card.style.transform = transform;
      card.style.opacity = opacity;
      card.style.zIndex = zIndex;
      card.style.visibility = hidden ? "hidden" : "visible";
      const overlay = card.lastElementChild as HTMLElement | null;
      if (overlay) overlay.style.opacity = shade;
    });

    // Knob detent: tick whenever a new card crosses the center (drawn state only, no logic).
    const centered = Math.round(position.current);
    if (centered !== tickedIndex.current) {
      if (tickedIndex.current !== -1) tick();
      tickedIndex.current = centered;
    }
  }, []);

  /** One loop eases `position` to `target` and stops itself when settled. */
  const run = useCallback(() => {
    if (raf.current) return;
    lastTime.current = performance.now();
    const frame = (now: number) => {
      const dt = Math.min((now - lastTime.current) / 1000, 1 / 20);
      lastTime.current = now;
      if (drag.current?.moved) {
        // The finger is driving; position was set in onPointerMove.
      } else if (fling.current) {
        // Coasting after a swipe: keep travelling, slow down, snap when it runs out.
        position.current += fling.current * dt;
        fling.current *= Math.exp(-dt * FLING_FRICTION);
        const hitEnd = position.current <= 0 || position.current >= count - 1;
        if (hitEnd || Math.abs(fling.current) < FLING_STOP_SPEED) {
          fling.current = 0;
          goToRef.current(Math.round(clamp(position.current, 0, count - 1)));
        } else {
          // Selection follows the card passing the center, so the rest of the page keeps up.
          const centered = clamp(Math.round(position.current), 0, count - 1);
          if (centered !== target.current) {
            target.current = centered;
            const l = latest.current;
            if (centered !== l.selectedIndex) l.onSelect(l.wallpapers[centered]);
          }
        }
      } else {
        const diff = target.current - position.current;
        position.current = Math.abs(diff) < 0.0008 ? target.current : position.current + diff * (1 - Math.exp(-dt * EASE_RATE));
      }
      // Visual only: the orb is engaged while you're turning (drag, wheel gesture, or travel),
      // then relaxes to flat.
      const engaged =
        drag.current?.moved ||
        fling.current !== 0 ||
        performance.now() - wheel.current.lastEvent < ORB_HOLD_MS ||
        Math.abs(target.current - position.current) > 0.02;
      const goal = engaged ? 1 : 0;
      orbLevel.current += (goal - orbLevel.current) * (1 - Math.exp(-dt * (engaged ? ORB_IN_RATE : ORB_OUT_RATE)));
      if (!engaged && orbLevel.current < 0.002) orbLevel.current = 0;
      paint();
      // Lock (focus + glow) once the card has visually arrived, not after the easing tail or the orb
      // relaxing.
      const stopped = !drag.current?.moved && Math.abs(target.current - position.current) < LOCK_DISTANCE;
      if (stopped && lockedIndex.current !== target.current) {
        lockedIndex.current = target.current;
        setRestingIndex(target.current);
      }
      if (drag.current?.moved || fling.current !== 0 || position.current !== target.current || orbLevel.current > 0)
        raf.current = requestAnimationFrame(frame);
      else {
        raf.current = 0;
        setRestingIndex(target.current);
      }
    };
    raf.current = requestAnimationFrame(frame);
  }, [paint, count]);

  // `run`'s loop needs goTo, which needs run; this breaks the cycle.
  const goToRef = useRef<(i: number) => void>(() => {});

  /** Moves to card `i` and makes it the selection. */
  const goTo = useCallback(
    (i: number) => {
      const { wallpapers: list, onSelect: select, onPreload: preload, selectedIndex: current } = latest.current;
      const next = clamp(Math.round(i), 0, list.length - 1);
      target.current = next;
      [list[next + 1], list[next - 1]].forEach((w) => w && preload(w));
      if (next !== current) select(list[next]);
      run();
    },
    [run],
  );
  goToRef.current = goTo;

  // Selection changed elsewhere (keyboard, first load): head there.
  useLayoutEffect(() => {
    if (target.current !== selectedIndex) {
      target.current = selectedIndex;
      run();
    }
  }, [selectedIndex, run]);

  useLayoutEffect(() => {
    paint();
    const mq = window.matchMedia(DESKTOP);
    const repaint = () => {
      lastStyles.current = [];
      paint();
    };
    mq.addEventListener("change", repaint);
    window.addEventListener("resize", repaint);
    return () => {
      mq.removeEventListener("change", repaint);
      window.removeEventListener("resize", repaint);
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, [paint]);

  // Wheel / trackpad: exactly one card per gesture.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const vertical = isVertical();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
      const primary = vertical ? e.deltaY : Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const d = primary * unit;
      const abs = Math.abs(d);
      const w = wheel.current;
      const now = performance.now();
      const quiet = now - w.lastEvent > WHEEL_IDLE_MS;
      // Momentum only decays; a sudden rise means the user started a new swipe.
      const newSwipe = w.locked && abs > 8 && abs > w.lastAbs * REACCELERATION;
      if (quiet || newSwipe) {
        w.locked = false;
        w.acc = 0;
      }
      w.lastEvent = now;
      w.lastAbs = abs;
      if (w.locked) return;
      w.acc += d;
      if (Math.abs(w.acc) >= WHEEL_STEP) {
        goTo(target.current + Math.sign(w.acc));
        w.acc = 0;
        w.locked = true;
      }
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [goTo]);

  // Drag (touch, pen or mouse): follow the pointer, then settle on one card.
  const pointerAxis = (e: React.PointerEvent) => (isVertical() ? e.clientY : e.clientX);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    fling.current = 0; // touching the rail catches it, like a spinning wheel
    target.current = clamp(Math.round(position.current), 0, count - 1);
    drag.current = { id: e.pointerId, start: pointerAxis(e), startPos: position.current, moved: false, samples: [] };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const first = cardRefs.current.find(Boolean);
    if (!d || d.id !== e.pointerId || !first) return;
    const delta = pointerAxis(e) - d.start;
    if (!d.moved) {
      if (Math.abs(delta) < DRAG_SLOP) return;
      d.moved = true;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Pointer already gone; the drag still works through the element's own events.
      }
    }
    const pitch = (isVertical() ? first.offsetHeight : first.offsetWidth) + GAP;
    // Rubber-band past the ends.
    let next = d.startPos - delta / pitch;
    if (next < 0) next *= 0.35;
    if (next > count - 1) next = count - 1 + (next - (count - 1)) * 0.35;
    position.current = next;
    d.samples.push({ t: performance.now(), v: next });
    if (d.samples.length > 8) d.samples.shift();
    run();
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== e.pointerId || !d.moved) return;
    suppressClick.current = true;
    // Only the tail of the gesture decides the throw, so a slow finish stops where you left it.
    const last = d.samples[d.samples.length - 1];
    const first = d.samples.find((s) => last.t - s.t <= FLING_SAMPLE_MS) ?? d.samples[0];
    const velocity = last.t > first.t ? (last.v - first.v) / (last.t - first.t) : 0; // cards per ms
    const speed = velocity * 1000; // cards per second
    const inBounds = position.current > 0 && position.current < count - 1;
    if (e.pointerType !== "mouse" && inBounds && Math.abs(speed) >= FLING_MIN_SPEED) {
      fling.current = clamp(speed, -FLING_MAX_SPEED, FLING_MAX_SPEED);
      run();
      return;
    }
    let next = Math.round(position.current + velocity * FLICK_MS);
    const start = Math.round(d.startPos);
    // Any deliberate drag moves at least one card.
    if (next === start && Math.abs(position.current - d.startPos) > 0.15) next = start + Math.sign(position.current - d.startPos);
    goTo(next);
  };

  const atStart = selectedIndex === 0;
  const atEnd = selectedIndex === count - 1;
  const arrow =
    "pointer-events-auto inline-flex size-8 items-center justify-center rounded-full bg-surface/85 text-label shadow-[0_0_0_0.5px_rgb(0_0_0/0.1),0_4px_12px_-4px_rgb(0_0_0/0.25)] backdrop-blur-xl transition-[opacity,transform,background-color] duration-200 hover:bg-surface active:scale-95 disabled:opacity-30 disabled:active:scale-100";

  return (
    <div
      ref={stageRef}
      role="listbox"
      aria-label="Wallpapers"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={(e) => {
        if (suppressClick.current) {
          suppressClick.current = false;
          e.stopPropagation();
          e.preventDefault();
        }
      }}
      className={[
        "relative size-full touch-none select-none overflow-hidden",
        "[perspective:600px] lg:[perspective:650px]",
        // Where the locked card sits: a little above center on the vertical (desktop) rail.
        "[--center-y:50%] lg:[--center-y:calc(45%_+_12px)] [perspective-origin:50%_var(--center-y)]",
        "[--item-w:64vw] sm:[--item-w:40vw] lg:[--item-w:min(28vw,460px)]",
        "[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
        "lg:[mask-image:linear-gradient(to_bottom,transparent,black_14%,black_86%,transparent)]",
      ].join(" ")}
    >
      {wallpapers.map((w, i) => {
        const active = i === selectedIndex;
        return (
          <button
            key={w.id}
            ref={(node) => {
              cardRefs.current[i] = node;
            }}
            type="button"
            role="option"
            aria-selected={active}
            aria-label={displayTitle(w.title)}
            tabIndex={active ? 0 : -1}
            onClick={() => (active ? undefined : goTo(i))}
            onPointerEnter={() => onPreload(w)}
            className="absolute top-(--center-y) left-1/2 aspect-[16/10] w-(--item-w) overflow-hidden rounded-[14px] bg-fill outline-offset-4 transition-[box-shadow,filter] duration-200 ease-(--ease-mac) [backface-visibility:hidden] will-change-transform"
            style={{
              filter: `blur(${BLUR_BY_DISTANCE[Math.min(Math.abs(i - restingIndex), BLUR_BY_DISTANCE.length - 1)]}px)`,
              boxShadow: i === restingIndex
                ? // Locked: thin bright rim + faint accent halo, over the usual drop shadow.
                  "0 0 0 1px rgb(255 255 255 / 0.75), 0 0 0 2px color-mix(in srgb, var(--accent) 22%, transparent), 0 0 24px -4px color-mix(in srgb, var(--accent) 35%, transparent), 0 18px 40px -16px rgb(0 0 0 / 0.45)"
                : "0 0 0 0.5px rgb(0 0 0 / 0.1), 0 4px 12px -6px rgb(0 0 0 / 0.2)",
            }}
          >
            <Image
              src={displayUrl(w)}
              alt={`${displayTitle(w.title)} desktop wallpaper`}
              fill
              sizes="(min-width: 1024px) 460px, 64vw"
              loading={Math.abs(i - restingIndex) < 3 ? "eager" : "lazy"}
              placeholder={w.blur_data_url ? "blur" : "empty"}
              blurDataURL={w.blur_data_url ?? undefined}
              draggable={false}
              className="pointer-events-none object-cover"
            />
            {/* Depth shading; opacity driven by paint(). Must stay the last child. */}
            <span aria-hidden className="pointer-events-none absolute inset-0 bg-black opacity-0" />
          </button>
        );
      })}

      {/* Step controls: stacked ↑/↓ beside the active card on desktop, ←/→ at the edges on mobile. */}
      <div className="pointer-events-none absolute inset-0 z-[200] flex items-center justify-between px-2 lg:block lg:p-0">
        <div className="contents lg:absolute lg:top-(--center-y) lg:left-[calc(50%+var(--item-w)/2+18px)] lg:flex lg:-translate-y-1/2 lg:flex-col lg:gap-2">
          <button
            type="button"
            aria-label="Previous wallpaper"
            disabled={atStart}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => goTo(target.current - 1)}
            className={arrow}
          >
            <ChevronLeft width={16} height={16} className="lg:rotate-90" />
          </button>
          <button
            type="button"
            aria-label="Next wallpaper"
            disabled={atEnd}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => goTo(target.current + 1)}
            className={arrow}
          >
            <ChevronRight width={16} height={16} className="lg:rotate-90" />
          </button>
        </div>
      </div>
    </div>
  );
}
