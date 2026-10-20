/**
 * Fixtures DataSource: the whole store from JSON in this folder (SPEC §5.1).
 * Built from OzLED's public catalogue by scripts/fixtures. Validated on load,
 * so a bad fixture fails the build rather than rendering a broken page.
 */
import { z } from "zod";
import * as S from "../schema";
import { createMemorySource } from "../memory";
import { STATIC_PATHS } from "../path-index";
import { isCommercePath } from "@/lib/commerce";

import productsRaw from "./products.json";
import categoriesRaw from "./categories.json";
import hubsRaw from "./hubs.json";
import kitsRaw from "./kits.json";
import bannersRaw from "./banners.json";
import postsRaw from "./posts.json";
import contentRaw from "./content.json";
import redirectsRaw from "./redirects.json";

const products = z.array(S.Product).parse(productsRaw);
const categories = z.array(S.Category).parse(categoriesRaw);
const hubs = z.array(S.ApplicationHub).parse(hubsRaw);
const kits = z.array(S.Kit).parse(kitsRaw);
const banners = z.array(S.Banner).parse(bannersRaw);
const posts = z.array(S.BlogPost).parse(postsRaw);
const content = z.array(S.ContentPage).parse(contentRaw);
const redirects = z.array(S.Redirect).parse(redirectsRaw);

/**
 * The pitch build carries a slice of the catalogue, so scraped HTML links to many
 * live pages it doesn't have. Those go to the live site; links to pages we do have
 * become relative. (In Neto mode every page exists, so this only applies here.)
 */
const LIVE = (process.env.NEXT_PUBLIC_COMMERCE_ORIGIN ?? "https://www.ozled.com.au").replace(/\/$/, "");
const stocked = new Set(products.flatMap((p) => p.categoryIds));
const nonEmpty = (id: string): boolean => stocked.has(id) || categories.some((c) => c.parentId === id && nonEmpty(c.id));
const known = new Set([
  ...STATIC_PATHS,
  ...categories.filter((c) => nonEmpty(c.id)).map((c) => c.path),
  ...[products, hubs, kits, posts, content].flatMap((l) => l.map((x) => x.path)),
]);

function relink(html: string): string {
  return html.replace(/href="(https?:\/\/(?:www\.)?ozled\.com\.au)?(\/[^"#?]*)([^"]*)"/gi, (_m, _origin, path: string, rest: string) => {
    if (known.has(path) || isCommercePath(path)) return `href="${path}${rest}"`;
    return `href="${LIVE}${path}${rest}" rel="noopener"`;
  });
}

for (const p of products) {
  p.descriptionHtml = relink(p.descriptionHtml);
  if (p.brand.path && !known.has(p.brand.path)) p.brand = { name: p.brand.name };
}
for (const c of categories) c.bodyHtml = relink(c.bodyHtml);
for (const h of hubs) h.adrExplainerHtml = relink(h.adrExplainerHtml);
for (const b of posts) b.bodyHtml = relink(b.bodyHtml);
for (const c of content) c.bodyHtml = relink(c.bodyHtml);

export const fixtures = createMemorySource({ products, categories, hubs, kits, banners, posts, content, redirects });
