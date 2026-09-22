import Link from "next/link";
import { SEGMENT, SEGMENTED_TRACK, SEGMENT_ACTIVE, SEGMENT_IDLE } from "./segmentedStyles";

/** Segmented control whose segments are links, for switching between sibling pages. */
export function SegmentedNav({
  label,
  items,
  current,
}: {
  label: string;
  items: { href: string; label: string }[];
  current: string;
}) {
  return (
    <nav aria-label={label} className={`${SEGMENTED_TRACK} self-start sm:self-auto`}>
      {items.map((item) => {
        const active = item.href === current;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`${SEGMENT} px-3.5 ${active ? SEGMENT_ACTIVE : SEGMENT_IDLE}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
