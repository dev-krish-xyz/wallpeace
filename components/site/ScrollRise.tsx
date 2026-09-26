"use client";

import { useEffect, useRef } from "react";

const clamp = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Tied to the scroll rather than fired once: while the block travels up the bottom part of the
 * screen it grows from small, low and invisible to full size, so leaving the section above
 * visibly hands over to it, at whatever speed the reader scrolls — and backs out the same way.
 */
export function ScrollRise({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let shift = 0; // the translate last applied, taken back out of the measurement
    const paint = () => {
      frame = 0;
      const vh = window.innerHeight;
      const top = el.getBoundingClientRect().top - shift;
      // 0 as its top edge appears at the bottom of the screen, 1 once it is near the top.
      const p = clamp((vh - top) / (vh * 0.8));
      const e = 1 - (1 - p) ** 3;
      el.style.opacity = e.toFixed(3);
      el.style.scale = (0.84 + 0.16 * e).toFixed(4);
      shift = (1 - e) * 160;
      el.style.translate = `0 ${shift.toFixed(1)}px`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div ref={ref} className={`origin-top will-change-transform ${className}`}>
      {children}
    </div>
  );
}
