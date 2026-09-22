import type { Metadata, Viewport } from "next";
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
      <body className="min-h-dvh" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
