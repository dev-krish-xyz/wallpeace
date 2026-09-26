"use client";

import { useEffect, useRef, useState } from "react";
import { DemoPlayer } from "./DemoPlayer";

export type Feature = {
  id: string;
  /** Plain text, for labels a screen reader announces. */
  name: string;
  tier: React.ReactNode;
  title: React.ReactNode;
  body: React.ReactNode;
  /** Seconds before the demonstration plays again; omit for one that already runs forever. */
  loop?: number;
  demo: React.ReactNode;
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The premium features as one story told by the scroll.
 *
 * On a wide screen the words scroll and the picture stays: a single stage holds still beside the
 * list and swaps to whichever feature is crossing the middle of the viewport, the outgoing one
 * blurring away as the next one resolves. Scrolling back walks it backwards. On a phone that pinned
 * stage would fight the thumb, so each feature simply carries its own demonstration inline and
 * plays it when it arrives.
 *
 * Only the demonstration on stage runs. The others are rewound, and ones far from the reader are
 * not mounted at all until the story gets near them, so their images and video never load early.
 */
export function FeatureStory({ features }: { features: Feature[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [onScreen, setOnScreen] = useState(false);
  const [mounted, setMounted] = useState(() => new Set([0, 1]));

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const mid = window.innerHeight / 2;

      // The feature on stage is the last one whose top has crossed the middle of the screen.
      let next = 0;
      stepRefs.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= mid) next = i;
      });
      setActive(next);

      const list = listRef.current?.getBoundingClientRect();
      if (list && railRef.current) {
        const p = Math.min(1, Math.max(0, (mid - list.top) / list.height));
        railRef.current.style.setProperty("--p", p.toFixed(4));
      }

      // Hidden (phone layout) measures as zero height, which reads as off screen: nothing on the
      // stage plays there.
      const stage = stageRef.current?.getBoundingClientRect();
      setOnScreen(!!stage && stage.height > 0 && stage.bottom > 0 && stage.top < window.innerHeight);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  // Mount the feature on stage and its neighbours, and keep whatever has been mounted: coming back
  // to a feature should not download it twice.
  useEffect(() => {
    setMounted((prev) => {
      const near = [active - 1, active, active + 1].filter((i) => i >= 0 && i < features.length);
      if (near.every((i) => prev.has(i))) return prev;
      return new Set([...prev, ...near]);
    });
  }, [active, features.length]);

  const goTo = (i: number) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    stepRefs.current[i]?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  };

  const current = features[active];

  return (
    <div className="mt-10 sm:mt-12 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 xl:gap-16">
      <ol ref={listRef} className="relative space-y-14 sm:space-y-16 lg:space-y-0">
        {/* How far through the story the reader is, drawn down the side of the list. */}
        <div aria-hidden className="absolute inset-y-0 left-0 hidden w-px bg-label/10 lg:block">
          <div ref={railRef} style={{ scale: "1 var(--p, 0)" }} className="h-full origin-top bg-label/35" />
        </div>

        {features.map((f, i) => {
          const on = i === active;
          return (
            <li
              key={f.id}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
              aria-current={on ? "step" : undefined}
              className="lg:flex lg:min-h-[72vh] lg:items-center lg:pl-9"
            >
              <div
                className={`transition-opacity duration-500 ease-(--ease-mac) ${on ? "lg:opacity-100" : "lg:opacity-30"}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[12px] font-semibold tracking-[0.04em] text-label-3 tabular-nums">
                    {pad(i + 1)}
                  </span>
                  {f.tier}
                </div>
                <h3 className="mt-3 font-display text-[26px] leading-[1.1] font-semibold tracking-[-0.026em] text-label sm:text-[30px] lg:text-[34px]">
                  {f.title}
                </h3>
                <p className="mt-3 max-w-[40ch] text-[14px] leading-relaxed text-label-2 sm:text-[15px]">
                  {f.body}
                </p>
              </div>

              <InlineDemo loop={f.loop}>{f.demo}</InlineDemo>
            </li>
          );
        })}
      </ol>

      {/* The stage. Its column stretches the full height of the list; the stage pins itself inside
       *  it, centred under the toolbar, for as long as the list is going by. */}
      <div className="hidden lg:block">
        <div
          ref={stageRef}
          className="sticky top-[calc((100vh+52px-var(--stage))/2)] h-(--stage) [--stage:min(580px,calc(100vh-132px))]"
        >
          <Glass className="h-full">
            {features.map((f, i) => (
              <DemoPlayer
                key={f.id}
                active={i === active && onScreen}
                loop={f.loop}
                className="absolute inset-0 flex scale-[0.97] items-center justify-center px-12 pt-16 pb-20 opacity-0 blur-[10px] transition-[opacity,filter,scale] duration-600 ease-(--ease-mac) data-on:scale-100 data-on:opacity-100 data-on:blur-none"
              >
                {mounted.has(i) && <div className="w-full max-w-[540px]">{f.demo}</div>}
              </DemoPlayer>
            ))}

            {/* Where in the story the stage is. The number swaps with the feature. */}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-6 pt-5">
              <span
                key={current.id}
                className="text-[12px] font-semibold tracking-[0.04em] text-label-2 tabular-nums [animation:label-in_0.4s_var(--ease-mac)_both]"
              >
                {pad(active + 1)} <span className="text-label-3">/ {pad(features.length)}</span>
              </span>
              <span key={`${current.id}-name`} className="text-[12px] font-medium text-label-3 [animation:label-in_0.4s_var(--ease-mac)_both]">
                {current.name}
              </span>
            </div>

            {/* One segment per feature, and a way to jump straight to one. */}
            <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1.5 pb-6">
              {features.map((f, i) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show ${pad(i + 1)}: ${f.name}`}
                  aria-current={i === active ? "step" : undefined}
                  className="group grid h-5 place-items-center"
                >
                  <span
                    className={`block h-[3px] rounded-full transition-[width,background-color] duration-500 ease-(--ease-mac) ${
                      i === active ? "w-7 bg-label/55" : "w-3 bg-label/15 group-hover:bg-label/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </Glass>
        </div>
      </div>
    </div>
  );
}

/** The two-layer glass the pricing cards are cut from, so the stage is the same material. */
function Glass({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`rounded-[28px] bg-white/55 p-[7px] backdrop-blur-md [box-shadow:inset_0_0_0_1px_rgb(255_255_255/0.75),inset_0_1px_0_rgb(255_255_255/0.95),0_30px_60px_-34px_rgb(12_38_90/0.38)] ${className}`}
    >
      <div className="relative h-full overflow-hidden rounded-[22px] bg-white/80 bg-[linear-gradient(180deg,rgb(226_237_251/0.85)_0%,rgb(255_255_255/0)_72%)] backdrop-blur-2xl [box-shadow:inset_0_0_0_1.25px_rgb(255_255_255/0.9),inset_0_1.5px_0_rgb(255_255_255/1),inset_0_0_10px_rgb(255_255_255/0.55)]">
        {children}
      </div>
    </div>
  );
}

/**
 * A phone's version of the stage: the demonstration under its own words, playing once most of it is
 * on screen and rewinding once it has gone, so the next visit starts from the top.
 */
function InlineDemo({ loop, children }: { loop?: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.35) setActive(true);
        else if (!entry.isIntersecting) setActive(false);
      },
      { threshold: [0, 0.35] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="mt-6 lg:hidden">
      <Glass>
        <DemoPlayer
          active={active}
          loop={loop}
          className="translate-y-3 px-5 py-8 opacity-0 transition-[opacity,translate] duration-600 ease-(--ease-mac) data-on:translate-y-0 data-on:opacity-100 sm:px-10 sm:py-10"
        >
          {children}
        </DemoPlayer>
      </Glass>
    </div>
  );
}
