import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  // Turbopack's tracer misses sharp's platform binary (@img/sharp-<os>-<arch>/lib/*.node + libvips),
  // so the admin function (where uploads are processed) would ship without it.
  outputFileTracingIncludes: {
    "/admin": ["./node_modules/@img/sharp-*/**/*"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 365,
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/wallpapers/**" }]
      : [],
  },
};

export default nextConfig;
