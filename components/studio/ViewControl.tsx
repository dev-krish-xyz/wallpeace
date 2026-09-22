"use client";

import { useRef, useState } from "react";

/** Dot stops from one side view (-1) through front (0) to the other (+1). */
const VIEW_STOPS = [-1, -0.5, 0, 0.5, 1];

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const nearestStop = (v: number) => VIEW_STOPS.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a));

/**
 * Horizontal track with dot stops that turns the MacBook left/right. Drag for a continuous turn;
 * release snaps to the nearest dot. Double-click returns to the front view.
 */
export function ViewControl({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const position = (v: number) => `${((v + 1) / 2) * 100}%`;

  const valueAt = (clientX: number) => {
    const r = trackRef.current!.getBoundingClientRect();
    return clamp(((clientX - r.left) / r.width) * 2 - 1, -1, 1);
  };

  const step = (dir: 1 | -1) => {
    const i = VIEW_STOPS.indexOf(nearestStop(value));
    onChange(VIEW_STOPS[clamp(i + dir, 0, VIEW_STOPS.length - 1)]);
  };

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Turn MacBook"
      aria-orientation="horizontal"
      aria-valuemin={-1}
      aria-valuemax={1}
      aria-valuenow={Number(value.toFixed(2))}
      aria-valuetext={value === 0 ? "Front" : value < 0 ? "Turned left" : "Turned right"}
      title="Drag to turn · double-click for front"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") step(-1);
        else if (e.key === "ArrowRight" || e.key === "ArrowUp") step(1);
        else if (e.key === "Home") onChange(-1);
        else if (e.key === "End") onChange(1);
        else return;
        e.preventDefault();
        e.stopPropagation(); // don't also switch wallpapers
      }}
      onDoubleClick={() => onChange(0)}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
        onChange(valueAt(e.clientX));
      }}
      onPointerMove={(e) => dragging && onChange(valueAt(e.clientX))}
      onPointerUp={(e) => {
        setDragging(false);
        onChange(nearestStop(valueAt(e.clientX)));
      }}
      onPointerCancel={() => {
        setDragging(false);
        onChange(nearestStop(value));
      }}
      className="group flex h-[30px] w-[176px] cursor-grab touch-none select-none items-center rounded-full bg-surface/80 px-3.5 shadow-[0_0_0_0.5px_rgb(0_0_0/0.1),0_6px_18px_-8px_rgb(0_0_0/0.3)] backdrop-blur-xl active:cursor-grabbing"
    >
      <div ref={trackRef} className="relative h-full w-full">
        {/* Rail */}
        <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-fill-2" />
        {/* Dot stops */}
        {VIEW_STOPS.map((stop) => {
          const on = nearestStop(value) === stop;
          return (
            <span
              key={stop}
              aria-hidden
              className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[background-color,width,height] duration-300 ${
                on ? "size-[6px] bg-accent" : stop === 0 ? "size-[5px] bg-label-3" : "size-[4px] bg-label-3"
              }`}
              style={{ left: position(stop) }}
            />
          );
        })}
        {/* Knob */}
        <span
          aria-hidden
          className={`absolute top-1/2 size-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_0.5px_rgb(0_0_0/0.12),0_2px_6px_rgb(0_0_0/0.25)] group-focus-visible:shadow-[0_0_0_3.5px_color-mix(in_srgb,var(--accent)_55%,transparent)] ${
            dragging ? "" : "transition-[left] duration-500 ease-(--ease-mac)"
          }`}
          style={{ left: position(value) }}
        />
      </div>
    </div>
  );
}
