"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, StarFill, XMark } from "@/components/ui/icons";

const LINKS: { href: string; label: string; star?: boolean }[] = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/collections", label: "Collections" },
  { href: "/premium", label: "Premium", star: true },
  { href: "/about", label: "About" },
];

function isActive(href: string, pathname: string) {
  // Wallpaper pages are the home studio opened on one wallpaper.
  if (href === "/") return pathname === "/" || pathname.startsWith("/w/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Inline links on tablets and desktops; a menu button on phones, where they don't fit. */
export function NavLinks() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close on navigation.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
        {LINKS.map((l) => {
          const active = isActive(l.href, pathname);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-[7px] px-2.5 py-1 text-[13px] font-medium transition-colors duration-150 ${
                active ? "text-label" : "text-label-2 hover:text-label"
              }`}
            >
              <span className="relative">
                {l.label}
                {l.star && <StarFill width={9} height={9} className="absolute -top-1 -right-3 text-premium" />}
              </span>
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="-mr-1.5 inline-flex size-9 items-center justify-center rounded-[9px] text-label transition-colors duration-150 active:bg-fill sm:hidden"
      >
        {open ? <XMark width={20} height={20} /> : <Menu width={20} height={20} />}
      </button>

      {/* Rendered at the page root: inside the toolbar its backdrop blur would trap it under the
          3D canvas. */}
      {open &&
        createPortal(
          <>
          {/* Sheet below the toolbar; tapping anywhere else closes it. */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-[52px] z-30 cursor-default bg-label/10 backdrop-blur-[2px] sm:hidden"
          />
          <nav
            aria-label="Main"
            className="fixed inset-x-0 top-[52px] z-40 origin-top border-b border-separator bg-surface px-3 pb-3 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.25)] [animation:appear_0.18s_var(--ease-mac)_both] sm:hidden"
          >
            <ul className="flex flex-col">
              {LINKS.map((l) => {
                const active = isActive(l.href, pathname);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={`block rounded-[10px] px-3 py-3 text-[15px] font-medium transition-colors duration-150 active:bg-fill ${
                        active ? "text-label" : "text-label-2"
                      }`}
                    >
                      <span className="relative">
                        {l.label}
                        {l.star && <StarFill width={11} height={11} className="absolute -top-1.5 -right-3.5 text-premium" />}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          </>,
          document.body,
        )}
    </>
  );
}
