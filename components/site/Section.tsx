import Link from "next/link";
import { Reveal } from "./Reveal";

type Action = { href: string; label: string };

/** A titled block of a page, with one or more "See All"-style links on the right. */
export function Section({
  title,
  eyebrow,
  subtitle,
  action,
  children,
}: {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  /** One link, or several: they sit in a row, with the last one being the section's own. */
  action?: Action | Action[];
  children: React.ReactNode;
}) {
  const actions = action ? (Array.isArray(action) ? action : [action]) : [];
  return (
    <section>
      <Reveal className="mb-5 flex flex-col items-start gap-2 sm:mb-7 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0">
          {eyebrow && <p className="mb-1 text-[13px] font-semibold text-accent">{eyebrow}</p>}
          <h2 className="font-display text-[28px] leading-tight font-semibold tracking-[-0.021em] text-label sm:text-[36px]">{title}</h2>
          {subtitle && <p className="mt-1 text-[14px] text-label-2 sm:text-[15px]">{subtitle}</p>}
        </div>
        {actions.length > 0 && (
          <div className="flex shrink-0 items-center gap-4">
            {actions.map((a) => (
              <Link key={a.href} href={a.href} className="rounded-md text-[14px] font-medium text-accent hover:underline">
                {a.label}
              </Link>
            ))}
          </div>
        )}
      </Reveal>
      {children}
    </section>
  );
}

/** Page title block for the library pages. */
export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-[36px] font-semibold tracking-[-0.024em] text-label sm:text-[44px]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-[60ch] text-[14px] leading-snug text-label-2 sm:text-[15px]">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

/** Centered content column shared by the library pages. */
export function PageBody({
  children,
  narrow,
  className = "",
}: {
  children: React.ReactNode;
  narrow?: boolean;
  className?: string;
}) {
  return (
    <main className={`mx-auto w-full ${narrow ? "max-w-[720px]" : "max-w-[1440px]"} px-5 py-10 lg:px-8 lg:py-14 ${className}`}>
      {children}
    </main>
  );
}
