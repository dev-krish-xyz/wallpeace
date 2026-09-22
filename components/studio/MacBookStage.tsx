"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LaptopFallback } from "@/components/preview/LaptopFallback";
import type { Finish } from "@/components/preview/finishes";
import { Collapse, Expand } from "@/components/ui/icons";

const MacBookScene = dynamic(() => import("@/components/preview/MacBookScene"), { ssr: false });

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const subscribeReducedMotion = (cb: () => void) => {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/** 3D MacBook that stays mounted while the screen swaps; a flat laptop covers first paint. */
export function MacBookStage({
  screenUrl,
  fallbackUrl,
  title,
  finish,
  view,
}: {
  screenUrl: string;
  fallbackUrl: string;
  title: string;
  finish: Finish;
  view: number;
}) {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );

  useEffect(() => setWebgl(supportsWebGL()), []);
  const onReady = useCallback(() => setReady(true), []);

  // Full screen: the browser's own where it allows it on an element; iPhone Safari only allows it
  // for video, so there the stage becomes a fixed overlay instead.
  const rootRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState<"native" | "overlay" | null>(null);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === rootRef.current ? "native" : null);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    if (fullscreen !== "overlay") return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFullscreen(null);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  const toggleFullscreen = async () => {
    if (fullscreen === "native") return void document.exitFullscreen().catch(() => {});
    if (fullscreen === "overlay") return setFullscreen(null);
    const el = rootRef.current;
    if (el && document.fullscreenEnabled) {
      try {
        await el.requestFullscreen();
        return;
      } catch {}
    }
    setFullscreen("overlay");
  };

  return (
    <div
      ref={rootRef}
      className={`bg-bg ${fullscreen === "overlay" ? "fixed inset-0 z-[1000]" : "relative size-full"}`}
    >
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
          ready ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <LaptopFallback src={fallbackUrl} alt={title} finish={finish} />
      </div>
      {webgl && (
        <div
          role="img"
          aria-label={`${title} previewed on a MacBook. Drag to rotate.`}
          className={`absolute inset-0 transition-opacity duration-700 ease-(--ease-mac) ${ready ? "opacity-100" : "opacity-0"}`}
        >
          <MacBookScene screenUrl={screenUrl} finish={finish} view={view} animate={!reducedMotion} onReady={onReady} />
        </div>
      )}
      <button
        type="button"
        aria-label={fullscreen ? "Exit full screen" : "View full screen"}
        title={fullscreen ? "Exit full screen" : "View full screen"}
        onClick={toggleFullscreen}
        className="absolute top-3 right-3 z-10 inline-flex size-8 items-center justify-center rounded-full bg-surface/85 text-label shadow-[0_0_0_0.5px_rgb(0_0_0/0.1),0_4px_12px_-4px_rgb(0_0_0/0.25)] backdrop-blur-xl transition-[transform,background-color] duration-200 hover:bg-surface active:scale-95 lg:top-4 lg:right-4"
      >
        {fullscreen ? <Collapse width={15} height={15} /> : <Expand width={15} height={15} />}
      </button>
    </div>
  );
}
