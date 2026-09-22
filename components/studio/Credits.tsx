"use client";

import { useEffect, useRef, useState } from "react";
import { Info } from "@/components/ui/icons";

// The 3D model is CC BY 4.0, which requires visible attribution; this keeps it one click away.
export function Credits() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const link = "underline decoration-label-3/50 underline-offset-2 hover:text-label";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Credits"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex size-7 items-center justify-center rounded-md text-label-2 transition-colors hover:bg-fill hover:text-label"
      >
        <Info width={17} height={17} />
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Credits"
          className="absolute top-9 right-0 z-50 w-64 rounded-[12px] bg-surface/90 p-3.5 text-[12px] leading-relaxed text-label-2 shadow-[0_0_0_0.5px_rgb(0_0_0/0.12),0_12px_32px_-10px_rgb(0_0_0/0.35)] backdrop-blur-xl animate-appear [animation-duration:200ms]"
        >
          <p className="mb-1 font-semibold text-label">Credits</p>
          <p>
            MacBook model:{" "}
            <a
              className={link}
              href="https://sketchfab.com/3d-models/macbook-pro-16-silver-3a53a9dba68f45a48f4fd216fb43ca02"
              target="_blank"
              rel="noopener noreferrer"
            >
              &ldquo;Macbook pro 16 silver&rdquo; by sugcx
            </a>
            ,{" "}
            <a className={link} href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">
              CC BY 4.0
            </a>
            , compressed and recolored for the web.
          </p>
        </div>
      )}
    </div>
  );
}
