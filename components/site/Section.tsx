import Link from "next/link";

/** A titled block of a page, with an optional "See All"-style link on the right. */
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
  action?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <p className="mb-0.5 text-[12px] font-semibold text-accent">{eyebrow}</p>}
          <h2 className="font-display text-[22px] font-semibold tracking-[-0.015em] text-label">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[13px] text-label-2">{subtitle}</p>}
        </div>
        {action && (
          <Link href={action.href} className="shrink-0 rounded-md text-[13px] font-medium text-accent hover:underline">
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

/** Page title block for the library pages. */
export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-label">{title}</h1>
        {subtitle && <p className="mt-1 max-w-[60ch] text-[13px] leading-snug text-label-2">{subtitle}</p>}
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
    <main className={`mx-auto w-full ${narrow ? "max-w-[720px]" : "max-w-[1200px]"} px-5 py-10 lg:px-10 lg:py-14 ${className}`}>
      {children}
    </main>
  );
}
