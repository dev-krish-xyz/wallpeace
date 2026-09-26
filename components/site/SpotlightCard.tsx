"use client";

import { useRef } from "react";

/**
 * A card that knows where the pointer is. It writes the cursor's position into `--x` / `--y` on
 * itself, which the card's highlight layers read — so the light follows the cursor instead of
 * sitting in a fixed corner. The signature of the dark cards on Linear, Vercel and Supabase.
 *
 * No state and no re-render: the handler writes two custom properties straight onto the node, and
 * the browser composites the change. Pointer devices only — a touch screen never fires this, and
 * the card is complete without it.
 */
export function SpotlightCard({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLLIElement>(null);

  return (
    <li
      ref={ref}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--x", `${e.clientX - r.left}px`);
        el.style.setProperty("--y", `${e.clientY - r.top}px`);
      }}
      className={className}
    >
      {children}
    </li>
  );
}
