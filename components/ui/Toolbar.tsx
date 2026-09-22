import Image from "next/image";
import Link from "next/link";

/** Unified window toolbar: translucent, blurred, hairline edge, like a macOS title bar. */
export function Toolbar({ left, right }: { left?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b border-separator bg-toolbar backdrop-blur-2xl backdrop-saturate-[1.8]">
      <div className="flex h-[52px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">{left}</div>
        <div className="flex min-w-0 items-center justify-end gap-2">{right}</div>
      </div>
    </header>
  );
}

export function Brand({ suffix }: { suffix?: string }) {
  return (
    <Link href="/" className="flex items-center gap-2 rounded-md text-[17px] font-bold tracking-[-0.015em]">
      <Image
        src="/logo.webp"
        alt=""
        width={30}
        height={30}
        priority
        unoptimized
        className="drop-shadow-[0_0.5px_1px_rgb(0_0_0/0.2)]"
      />
      <span>Wallpeace</span>
      {suffix && <span className="font-normal text-label-2">{suffix}</span>}
    </Link>
  );
}
