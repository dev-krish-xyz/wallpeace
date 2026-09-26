"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePlaying } from "./DemoPlayer";

/**
 * The uploaded live wallpaper, inside whatever screen it is placed in.
 *
 * Nothing is fetched until the demonstration is first on screen: the `<video>` element does not
 * exist before then, so the page never pays for a clip nobody scrolled to. The poster sits beneath
 * it the whole time, and the video fades in over it only once frames are actually playing — no
 * black flash while it buffers. Muted, looped and inline, which is what lets it autoplay.
 */
export function LiveVideo({
  webm,
  mp4,
  poster,
  alt,
}: {
  webm: string | null;
  mp4: string | null;
  poster: string;
  alt: string;
}) {
  const playing = usePlaying();
  const ref = useRef<HTMLVideoElement>(null);
  const [wanted, setWanted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (playing) setWanted(true);
  }, [playing]);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (playing) {
      // Autoplay can still be refused (low-power mode); the poster is then what stays on screen.
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [playing, wanted]);

  return (
    <>
      <Image src={poster} alt={alt} fill sizes="(min-width: 1024px) 560px, 90vw" className="object-cover" />
      {wanted && (
        <video
          ref={ref}
          muted
          loop
          playsInline
          preload="auto"
          poster={poster}
          aria-hidden
          onPlaying={() => setReady(true)}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ease-(--ease-mac) ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        >
          {webm && <source src={webm} type="video/webm" />}
          {mp4 && <source src={mp4} type="video/mp4" />}
        </video>
      )}
    </>
  );
}
