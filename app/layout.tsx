import type { Metadata, Viewport } from "next";
import { FooterSlot } from "@/components/site/FooterSlot";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SITE_URL } from "@/lib/env";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Wallpeace", template: "%s — Wallpeace" },
  description: "A small, carefully made library of original desktop wallpapers.",
  metadataBase: new URL(SITE_URL),
  openGraph: { type: "website", siteName: "Wallpeace" },
  twitter: { card: "summary_large_image" },
  // Google Search Console HTML-tag verification; only the token, e.g. "abc123…".
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // Browser extensions (Grammarly, Dark Reader, password managers) inject attributes on <html>
    // and <body> before hydration; this ignores attribute diffs on these two elements only.
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col" suppressHydrationWarning>
        {/* The page takes the height it needs and the footer follows it, never floating halfway up
         *  a short page like /admin/login. */}
        <div className="flex-1">{children}</div>
        <FooterSlot>
          <SiteFooter />
        </FooterSlot>
      </body>
    </html>
  );
}
