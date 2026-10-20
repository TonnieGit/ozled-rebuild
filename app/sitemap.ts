import type { MetadataRoute } from "next";
import { data } from "@/data";
import { absoluteUrl } from "@/seo/metadata";

/** XML sitemaps split by type (SPEC §8.2): /sitemap/products.xml etc. */
export const SITEMAP_IDS = ["products", "categories", "hubs", "content"] as const;

export async function generateSitemaps() {
  return SITEMAP_IDS.map((id) => ({ id }));
}

export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const id = await props.id;
  const paths = await data.listPaths();
  const pick = {
    products: ["product"],
    categories: ["category"],
    hubs: ["hub", "kit"],
    content: ["content", "post"],
  }[id as (typeof SITEMAP_IDS)[number]];
  if (!pick) return [];
  const entries = paths.filter((p) => pick.includes(p.type));
  // Empty listings are 404s, so leave them out (SPEC §8.3).
  const keep = await Promise.all(
    entries.map(async (p) => {
      if (p.type !== "category") return true;
      const c = await data.getCategory(p.path);
      return c ? (await data.getProductsByCategory(c.id, { pageSize: 1 })).total > 0 : false;
    }),
  );
  return entries
    .filter((_, i) => keep[i])
    .map((p) => ({ url: absoluteUrl(p.path), ...(p.updatedAt && { lastModified: p.updatedAt }) }))
    .concat(id === "content" ? [{ url: absoluteUrl("/blog/") }, { url: absoluteUrl("/trade/") }] : [])
    .concat(id === "categories" ? [{ url: absoluteUrl("/") }] : []);
}
