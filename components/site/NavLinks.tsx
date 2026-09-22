"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { StarFill } from "@/components/ui/icons";

const LINKS: { href: string; label: string; className?: string; star?: boolean }[] = [
  // The logo also goes home, so phones drop this link to keep the toolbar on one line.
  { href: "/", label: "Home", className: "hidden sm:flex" },
  { href: "/browse", label: "Browse" },
  { href: "/collections", label: "Collections" },
  // Phones reach this from the home page; the toolbar only fits three links there.
  { href: "/premium", label: "Premium", className: "hidden sm:flex", star: true },
  { href: "/about", label: "About" },
];

function isActive(href: string, pathname: string) {
  // The studio rewrites the URL to /w/<slug> as you scroll, and wallpaper pages are the same studio.
  if (href === "/") return pathname === "/" || pathname.startsWith("/w/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="flex items-center gap-0.5 sm:gap-1">
      {LINKS.map((l) => {
        const active = isActive(l.href, pathname);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`items-center gap-1 rounded-[7px] px-2 py-1 text-[13px] font-medium transition-colors duration-150 sm:px-2.5 ${
              active ? "text-label" : "text-label-2 hover:text-label"
            } ${l.className ?? "flex"}`}
          >
            {l.star && <StarFill width={12} height={12} className="text-premium" />}
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
