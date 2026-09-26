import Image from "next/image";
import Link from "next/link";
import { StarFill } from "@/components/ui/icons";
import { ResLabel } from "@/components/ui/ResolutionBadge";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Library",
    links: [
      { href: "/browse", label: "Browse all" },
      { href: "/browse/latest", label: "Latest" },
      { href: "/browse/popular", label: "Most downloaded" },
      { href: "/collections", label: "Collections" },
    ],
  },
  {
    title: "Premium",
    links: [
      { href: "/premium", label: "What Premium adds" },
      { href: "/premium#pricing-title", label: "Pricing" },
      { href: "/premium#faq-title", label: "Questions" },
    ],
  },
  {
    title: "Wallpeace",
    links: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
    ],
  },
];

/** The foot of every page: where to go next, and who made the pictures. */
export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-separator bg-grouped">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-12 lg:px-8 lg:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:gap-8">
          <div className="max-w-[34ch]">
            <Link href="/" className="flex items-center gap-2 rounded-md text-[17px] font-bold tracking-[-0.015em]">
              <Image src="/logo.webp" alt="" width={28} height={28} unoptimized />
              <span>Wallpeace</span>
            </Link>
            <p className="mt-3 text-[13px] leading-relaxed text-label-2">
              Original desktop wallpapers, made one at a time and checked on a real display. The open library is
              free to download, in <ResLabel>4K</ResLabel>, with no account.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-[11px] font-semibold tracking-[0.04em] text-label-3 uppercase">{col.title}</h2>
              <ul className="mt-3.5 flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="rounded-md text-[13px] text-label-2 transition-colors duration-150 hover:text-label"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-separator pt-6 sm:flex-row sm:items-center sm:justify-between">
          {/* The year is rendered on the server, so it never disagrees with the client after hydration. */}
          <p className="text-[12px] text-label-3">
            © {new Date().getFullYear()} Wallpeace · Every wallpaper is original work.
          </p>
          <p className="flex items-center gap-1.5 text-[12px] text-label-3">
            <StarFill width={11} height={11} className="text-premium" />
            Premium from $5, paid once.
          </p>
        </div>
      </div>
    </footer>
  );
}
