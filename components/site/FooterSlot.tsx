"use client";

import { usePathname } from "next/navigation";

/**
 * Hides the footer on the admin routes. The footer lives in the root layout so every public page
 * gets it without repeating itself, and a child layout cannot take a parent's markup away — so the
 * decision is made here instead, on the one thing that differs: the path.
 *
 * The footer itself stays a server component; it is passed through as children.
 */
export function FooterSlot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
  return <>{children}</>;
}
