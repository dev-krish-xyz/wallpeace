"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { drawDockIcons } from "@/components/preview/dockIcons";
import { usePlaying } from "../DemoPlayer";

/** "Saturday 26 September" and "9:41" — the way the lock screen writes them, no AM/PM. */
function readClock(now: Date) {
  const date = now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
  const time = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" })
    .formatToParts(now)
    .filter((p) => p.type !== "dayPeriod")
    .map((p) => p.value)
    .join("")
    .trim();
  const short = now.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
  return { date, time, short };
}

/**
 * The screen of a locked Mac, laid over whatever wallpaper is playing (its children).
 *
 * Clicking anywhere unlocks it: the clock and the login lift away, then the menu bar drops in and
 * the dock rises — the same glass dock the hero's MacBook draws, from the same `dockIcons` — with
 * the live wallpaper still moving behind them. It locks itself again whenever its chapter leaves the
 * screen, so the next visit starts at the lock screen.
 */
export function LockScreen({ children }: { children: React.ReactNode }) {
  const playing = usePlaying();
  const [locked, setLocked] = useState(true);
  const [clock, setClock] = useState<ReturnType<typeof readClock> | null>(null);
  const [dock, setDock] = useState<string[] | null>(null);

  // The real time, read on the client only, so the server never renders a stale one.
  useEffect(() => {
    const tick = () => setClock(readClock(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    // Eleven of the hero's icons, Browser through Podcasts: a dock that sits comfortably inside the screen.
    setDock(drawDockIcons().apps.slice(1, 12));
  }, []);

  useEffect(() => {
    if (!playing) setLocked(true);
  }, [playing]);

  const ease = "duration-500 ease-(--ease-mac)";

  return (
    <div className="@container absolute inset-0 overflow-hidden">
      {children}

      {/* ---- Lock screen ---- */}
      <button
        type="button"
        onClick={() => setLocked(false)}
        tabIndex={locked ? 0 : -1}
        aria-label="Unlock the Mac"
        aria-hidden={!locked}
        className={`absolute inset-0 flex cursor-pointer flex-col items-center text-white transition-[opacity,translate] ${ease} ${
          locked ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-[6%] opacity-0"
        }`}
      >
        {/* A touch of shade behind the clock, as macOS lays over a bright wallpaper. */}
        <span aria-hidden className="absolute inset-x-0 top-0 h-1/2 bg-[linear-gradient(180deg,rgb(0_0_0/0.22),transparent)]" />
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(0deg,rgb(0_0_0/0.28),transparent)]" />

        {/* The date in frosted type: milky, half see-through, softened at the edges by its own glow. */}
        <span
          className={`relative mt-[7%] text-[11px] font-semibold tracking-[0.01em] text-white/70 transition-opacity duration-500 [text-shadow:0_0_3px_rgb(255_255_255/0.55),0_0_10px_rgb(255_255_255/0.3),0_1px_6px_rgb(0_0_0/0.12)] ${
            clock ? "opacity-100" : "opacity-0"
          }`}
        >
          {clock?.date ?? " "}
        </span>
        {/* The time in liquid glass: a translucent fill that brightens toward the top, a bright rim,
         *  and a soft shadow so it lifts off the picture. */}
        <span
          className={`relative mt-1 bg-[linear-gradient(180deg,rgb(255_255_255/0.95)_0%,rgb(255_255_255/0.5)_48%,rgb(255_255_255/0.72)_100%)] bg-clip-text font-display text-[64px] leading-[0.95] font-semibold tracking-[-0.02em] text-transparent drop-shadow-[0_2px_12px_rgb(0_0_0/0.22)] transition-opacity duration-500 [-webkit-text-stroke:0.7px_rgb(255_255_255/0.7)] ${
            clock ? "opacity-100" : "opacity-0"
          }`}
        >
          {clock?.time ?? " "}
        </span>

        <span className="relative mt-auto mb-[6%] flex flex-col items-center">
          <span className="relative size-[30px] overflow-hidden rounded-full bg-white/25 ring-1 ring-white/45 backdrop-blur-md">
            <Image src="/logo.webp" alt="" fill sizes="60px" className="object-cover" />
          </span>
          <span className="mt-1.5 text-[9px] font-semibold text-white/95">Krish</span>
          <span className="mt-1.5 inline-flex h-[18px] items-center gap-1 rounded-full bg-white/20 px-2.5 text-[8px] font-medium text-white/85 ring-1 ring-white/35 backdrop-blur-md motion-safe:animate-pulse">
            Click to unlock
            <svg aria-hidden viewBox="0 0 16 16" className="size-[9px] fill-none stroke-current [stroke-linecap:round] [stroke-width:1.8]">
              <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" />
            </svg>
          </span>
        </span>
      </button>

      {/* ---- Desktop ---- */}
      <div aria-hidden={locked} className="pointer-events-none absolute inset-0">
        {/* Menu bar. */}
        <div
          style={{ transitionDelay: locked ? "0ms" : "220ms" }}
          className={`absolute inset-x-0 top-0 flex h-[5%] items-center justify-between px-[1.6%] text-[6.5px] font-medium text-white transition-[opacity,translate] [text-shadow:0_0_4px_rgb(0_0_0/0.35)] ${ease} ${
            locked ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          <span className="flex items-center gap-[1.2em]">
            <svg aria-hidden viewBox="0 0 17 20" className="h-[1.35em] fill-current drop-shadow-[0_0_2px_rgb(0_0_0/0.3)]">
              <path d="M11.2 4.3c.6-.8 1-1.8.9-2.8-.9 0-2 .6-2.6 1.4-.6.7-1 1.7-.9 2.7 1 .1 2-.5 2.6-1.3zM12.1 5.7c-1.4-.1-2.6.8-3.3.8-.7 0-1.7-.8-2.8-.7-1.5 0-2.8.8-3.6 2.1-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7 1.3 0 1.7.7 2.8.7 1.2 0 1.9-1 2.6-2.1.8-1.2 1.2-2.4 1.2-2.4s-2.3-.9-2.3-3.5c0-2.2 1.8-3.2 1.9-3.3-1-1.5-2.6-1.7-3.1-1.6z" />
            </svg>
            <span className="font-bold">Finder</span>
            <span>File</span>
            <span>Edit</span>
            <span>View</span>
            <span>Go</span>
            <span>Window</span>
            <span>Help</span>
          </span>
          <span className="pointer-events-auto flex items-center gap-[1.1em]">
            <svg aria-hidden viewBox="0 0 16 12" className="h-[1.1em] fill-none stroke-current [stroke-linecap:round] [stroke-width:1.6]">
              <path d="M1.5 4.5a9.5 9.5 0 0 1 13 0M4 7.2a6 6 0 0 1 8 0M6.5 9.8a2.4 2.4 0 0 1 3 0" />
            </svg>
            <svg aria-hidden viewBox="0 0 24 12" className="h-[1.05em]">
              <rect x="1" y="1" width="19" height="10" rx="3" className="fill-none stroke-current" strokeWidth="1.2" />
              <rect x="3" y="3" width="13" height="6" rx="1.5" className="fill-current" />
              <rect x="21.2" y="4" width="1.6" height="4" rx="0.8" className="fill-current" />
            </svg>
            <button
              type="button"
              tabIndex={locked ? -1 : 0}
              onClick={() => setLocked(true)}
              aria-label="Lock the Mac"
              className="rounded-[3px] px-[0.3em] hover:bg-white/25"
            >
              {clock ? `${clock.short}  ${clock.time}` : ""}
            </button>
          </span>
        </div>

        {/* The dock: the hero's icons, on the same kind of glass. Sized off the screen's width, so it
         *  keeps its proportions at any size. */}
        <div
          style={{ transitionDelay: locked ? "0ms" : "320ms" }}
          className={`absolute bottom-[1.6%] left-1/2 flex w-max -translate-x-1/2 items-center gap-[0.75cqw] rounded-[1.9cqw] bg-white/22 p-[0.7cqw] ring-1 ring-white/45 backdrop-blur-lg transition-[opacity,translate] shadow-[0_6px_18px_-8px_rgb(0_0_0/0.35)] ${ease} ${
            locked ? "translate-y-[140%] opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          {dock?.map((src, i) => (
            // Canvas renders of the hero's dock icons, not remote images: next/image adds nothing.
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt="" className="size-[4.2cqw] drop-shadow-[0_1px_1.5px_rgb(0_0_0/0.18)]" />
          ))}
        </div>
      </div>

      {/* It is a live wallpaper, locked or not. */}
      <span className="pointer-events-none absolute top-[8%] right-[3%] inline-flex items-center gap-1 rounded-full bg-black/40 px-1.5 py-px text-[7px] font-semibold tracking-[0.08em] text-white/95 backdrop-blur-sm">
        <span className="size-1 rounded-full bg-[#ff453a] motion-safe:animate-pulse" />
        LIVE
      </span>
    </div>
  );
}
