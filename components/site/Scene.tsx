"use client";

import { useEffect, useRef, useState } from "react";

// Start playing as the row reaches the fold rather than once it is well inside it: waiting left a
// blank stretch on screen while the sequence was still holding at frame zero.
const ENTER = "0px 0px 8% 0px";

/**
 * A demonstration that plays itself. Like `Reveal`, but it rewinds: once the row is entirely off
 * screen the `data-shown` attribute comes off, which cancels every animation inside it (see the
 * `[data-scene]` rule in globals.css), so the next visit plays the sequence from the top again.
 *
 * Two observers rather than one, because the two edges are not the same line: it starts once the
 * row is properly in view, and only rewinds once none of it is left on screen. One observer for
 * both would rewind the sequence while its last strip was still visible.
 */
export function Scene({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const play = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShown(true);
      },
      { rootMargin: ENTER },
    );
    const rewind = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) setShown(false);
    });
    play.observe(el);
    rewind.observe(el);
    return () => {
      play.disconnect();
      rewind.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      data-scene=""
      data-shown={shown ? "" : undefined}
      className={`transition-[opacity,translate] duration-700 ease-(--ease-mac) motion-reduce:transition-none ${
        shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
