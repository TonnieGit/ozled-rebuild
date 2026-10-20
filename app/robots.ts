import type { MetadataRoute } from "next";
import { SITE_URL } from "@/seo/metadata";

const SITEMAPS = ["products", "categories", "hubs", "content"];

/**
 * Allow all; keep commerce, search and faceted URLs out (SPEC §8.2). AI crawlers are
 * allowed by default (SPEC §9; owner decision, open question §14.8).
 */
export default function robots(): MetadataRoute.Robots {
  if (process.env.ALLOW_INDEXING !== "1") {
    // Pre-launch / pitch deployments: block everything (see next.config.ts headers).
    return { rules: [{ userAgent: "*", disallow: "/" }], sitemap: SITEMAPS.map((id) => `${SITE_URL}/sitemap/${id}.xml`) };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Facet params are NOT disallowed: crawlers must be able to see the noindex on
        // filtered pages, and allow-listed filter pages must stay indexable (decisions.md).
        disallow: ["/_mycart", "/_myacct", "/myacct", "/do/", "/ajax/", "/api/", "/search", "/*?*sort="],
      },
    ],
    sitemap: SITEMAPS.map((id) => `${SITE_URL}/sitemap/${id}.xml`),
    host: SITE_URL,
  };
}
