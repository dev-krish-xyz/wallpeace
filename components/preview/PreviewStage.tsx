"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Segmented } from "@/components/ui/Segmented";
import { LaptopFallback } from "./LaptopFallback";
import { FINISHES, type Finish } from "./finishes";

const MacBookScene = dynamic(() => import("./MacBookScene"), { ssr: false });

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

const subscribeReducedMotion = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

const FINISH_KEY = "wallpeace:finish";

export function PreviewStage({ screenUrl, fallbackUrl, title }: { screenUrl: string; fallbackUrl: string; title: string }) {
  const [finish, setFinish] = useState<Finish>("space-black");
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );

  useEffect(() => {
    setWebgl(supportsWebGL());
    try {
      const saved = localStorage.getItem(FINISH_KEY);
      if (saved === "silver" || saved === "space-black") setFinish(saved);
    } catch {}
  }, []);

  const changeFinish = (f: Finish) => {
    setFinish(f);
    try {
      localStorage.setItem(FINISH_KEY, f);
    } catch {}
  };

  const onReady = useCallback(() => setReady(true), []);

  return (
    <div className="relative">
      <div className="relative h-[clamp(300px,58vw,680px)] w-full">
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
            ready ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <LaptopFallback src={fallbackUrl} alt={title} finish={finish} />
        </div>
        {webgl && (
          <div
            className={`absolute inset-0 transition-opacity duration-700 ease-(--ease-mac) ${ready ? "opacity-100" : "opacity-0"}`}
            aria-label={`${title} previewed on a MacBook. Drag to rotate.`}
            role="img"
          >
            <MacBookScene screenUrl={screenUrl} finish={finish} animate={!reducedMotion} onReady={onReady} />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-center gap-4">
        <Segmented
          label="MacBook finish"
          value={finish}
          onChange={changeFinish}
          options={(Object.keys(FINISHES) as Finish[]).map((k) => ({ value: k, label: FINISHES[k].label }))}
        />
        {webgl && <span className="hidden text-[12px] text-label-3 sm:inline">Drag to rotate</span>}
      </div>
    </div>
  );
}
