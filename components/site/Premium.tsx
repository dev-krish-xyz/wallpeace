import Link from "next/link";
import { StarFill } from "@/components/ui/icons";

export const PREMIUM_POINTS = [
  {
    title: "Complete series",
    body: "Larger sets built around one world, made to work together across your desktops.",
  },
  {
    title: "Master files",
    body: "The highest-resolution masters, straight from the studio, for large and high-density displays.",
  },
  {
    title: "Early access",
    body: "New premium wallpapers before anywhere else, with more added over time.",
  },
];

export function ComingSoonBadge() {
  return (
    <span className="inline-flex h-[20px] items-center rounded-full bg-fill-2 px-2 text-[11px] font-semibold text-label-2">
      Coming Soon
    </span>
  );
}

export function PremiumPoints() {
  return (
    <ul className="grid gap-6 sm:grid-cols-3">
      {PREMIUM_POINTS.map((p) => (
        <li key={p.title}>
          <h3 className="text-[15px] font-semibold text-label">{p.title}</h3>
          <p className="mt-0.5 text-[13px] leading-relaxed text-label-2">{p.body}</p>
        </li>
      ))}
    </ul>
  );
}

/** Home page teaser for the premium tier. */
export function PremiumTeaser() {
  return (
    <section className="rounded-[14px] bg-grouped px-6 py-12 sm:px-10">
      <div className="flex flex-wrap items-center gap-2.5">
        <h2 className="flex items-center gap-2 font-display text-[22px] font-semibold tracking-[-0.015em] text-label">
          <StarFill width={20} height={20} className="text-premium" />
          Wallpeace Premium
        </h2>
        <ComingSoonBadge />
      </div>
      <p className="mt-1.5 max-w-[60ch] text-[13px] leading-relaxed text-label-2">
        A members-only library of the most ambitious Wallpeace wallpapers. The free library isn&apos;t going
        anywhere; Premium adds to it.
      </p>
      <div className="mt-8">
        <PremiumPoints />
      </div>
      <Link href="/premium" className="mt-8 inline-block rounded-md text-[13px] font-medium text-accent hover:underline">
        Learn More
      </Link>
    </section>
  );
}
