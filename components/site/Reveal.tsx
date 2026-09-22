"use client";

import { useEffect, useRef, useState } from "react";

// Reveal once the element's top edge has come this far into the viewport.
const TRIGGER = 0.94;

/**
 * Fades and lifts its children into place the first time they reach the viewport. A plain scroll
 * check rather than IntersectionObserver: jumping past a section (Home/End, a long flick, a restored
 * scroll position) must still reveal it, never leave it invisible.
 */
export function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    let frame = 0;
    const check = () => {
      frame = 0;
      const top = el.getBoundingClientRect().top;
      if (top >= window.innerHeight * TRIGGER) return;
      setShown(true);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={shown && delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`transition-[opacity,translate] duration-700 ease-(--ease-mac) motion-reduce:transition-none ${
        shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
