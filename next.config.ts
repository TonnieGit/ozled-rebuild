import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Trailing slashes are meaningful on OzLED's legacy URLs; proxy.ts preserves them.
  skipTrailingSlashRedirect: true,
  poweredByHeader: false,
  // Safety: any deployment is noindex unless ALLOW_INDEXING=1 (set only at launch),
  // so the pitch build can never compete with the live site in search.
  async headers() {
    if (process.env.ALLOW_INDEXING === "1") return [];
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "www.ozled.com.au" },
      { protocol: "https", hostname: "cdn.neto.com.au" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
