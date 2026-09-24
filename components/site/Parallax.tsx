"use client";

import { useEffect, useRef } from "react";

/**
 * Shifts its children a few pixels against the scroll, so a still image reads as having depth.
 * Deliberately tiny: the effect should be felt, not seen. Off under reduced motion.
 */
export function Parallax({
  amount = 12,
  className = "",
  children,
}: {
  /** Maximum shift in pixels, reached at the top and bottom of the viewport. */
  amount?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const paint = () => {
      frame = 0;
      const box = el.getBoundingClientRect();
      // Off-screen elements cost nothing but a rect read.
      if (box.bottom < 0 || box.top > window.innerHeight) return;
      // -1 at the bottom of the viewport, +1 at the top.
      const progress = 1 - (2 * (box.top + box.height / 2)) / window.innerHeight;
      el.style.setProperty("--parallax", `${(progress * amount).toFixed(2)}px`);
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
  }, [amount]);

  return (
    <div ref={ref} style={{ translate: "0 var(--parallax, 0px)" }} className={className}>
      {children}
    </div>
  );
}
