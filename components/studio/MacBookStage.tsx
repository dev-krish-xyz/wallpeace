"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { LaptopFallback } from "@/components/preview/LaptopFallback";
import type { Finish } from "@/components/preview/finishes";

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

  return (
    <div className="relative size-full">
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
    </div>
  );
}
