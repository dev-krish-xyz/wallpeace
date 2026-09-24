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
  // One canonical host: www.wallpeace.com → wallpeace.com.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.wallpeace.com" }],
        destination: "https://wallpeace.com/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // 75 is the default every wallpaper uses; 95 is the brand banner, which is a flat sky the
    // optimizer would band at 75. Next 16 refuses any quality not listed here.
    qualities: [75, 95],
    minimumCacheTTL: 60 * 60 * 24 * 365,
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/wallpapers/**" }]
      : [],
  },
};

export default nextConfig;
