import Link from "next/link";

/** Unified window toolbar: translucent, blurred, hairline edge, like a macOS title bar. */
export function Toolbar({
  left,
  center,
  right,
}: {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-separator bg-toolbar backdrop-blur-2xl backdrop-saturate-[1.8]">
      <div className="mx-auto grid h-[52px] max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">{left}</div>
        <div className="min-w-0 truncate text-center text-[13px] font-semibold text-label">{center}</div>
        <div className="flex min-w-0 items-center justify-end gap-2">{right}</div>
      </div>
    </header>
  );
}

export function Brand({ suffix }: { suffix?: string }) {
  return (
    <Link href="/" className="group flex items-center gap-2 rounded-md text-[13px] font-semibold tracking-[-0.01em]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon.svg" alt="" width={20} height={20} className="rounded-[5px] shadow-[0_0.5px_1.5px_rgb(0_0_0/0.25)]" />
      <span>Wallpeace</span>
      {suffix && <span className="font-normal text-label-2">{suffix}</span>}
    </Link>
  );
}
