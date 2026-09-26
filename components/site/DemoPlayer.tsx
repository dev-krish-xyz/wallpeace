"use client";

import { createContext, useContext, useEffect, useState } from "react";

/** How long a demonstration takes to fade away, before it is rewound out of sight. */
export const LEAVE_MS = 600;

/** Whether the demonstration around a component is the one on screen — for the video to follow. */
const Playing = createContext(false);
export const usePlaying = () => useContext(Playing);

/**
 * Runs one demonstration while `active`, and loops it every `loop` seconds.
 *
 * Built on the same switch as `Scene`: while `data-shown` is off, the `[data-scene]` rule in
 * globals.css takes every animation's name away, and putting it back starts each one from its first
 * frame. A loop is a short fade out, that rewind, and a fade back in — never a cut to frame zero in
 * plain sight. `data-on` is what the caller styles the visible state with.
 */
export function DemoPlayer({
  active,
  loop,
  className = "",
  children,
}: {
  active: boolean;
  /** Seconds before the sequence plays again. Omit for demos that already run forever. */
  loop?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const [running, setRunning] = useState(false);
  const [resting, setResting] = useState(false);

  useEffect(() => {
    if (!active) {
      // Let the fade out finish before the picture jumps back to its opening frame.
      const t = window.setTimeout(() => setRunning(false), LEAVE_MS);
      return () => window.clearTimeout(t);
    }

    setRunning(true);
    setResting(false);
    if (!loop || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
    const cycle = () =>
      later(() => {
        setResting(true);
        later(() => {
          setRunning(false);
          // One frame with no animation is what makes the next one a fresh start.
          later(() => {
            setRunning(true);
            setResting(false);
            cycle();
          }, 60);
        }, LEAVE_MS);
      }, loop * 1000);
    cycle();
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [active, loop]);

  return (
    <Playing.Provider value={active && running}>
      <div
        data-scene=""
        data-shown={running ? "" : undefined}
        data-on={active && !resting ? "" : undefined}
        inert={!active}
        className={className}
      >
        {children}
      </div>
    </Playing.Provider>
  );
}
