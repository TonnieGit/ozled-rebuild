/**
 * Lightweight set of every routable storefront path, for proxy.ts to answer
 * 404 / one-hop slash 301 with real HTTP statuses before rendering.
 * No zod, no server-only: it must be cheap to load in the proxy.
 */
import products from "./fixtures/products.json";
import categories from "./fixtures/categories.json";
import hubs from "./fixtures/hubs.json";
import kits from "./fixtures/kits.json";
import posts from "./fixtures/posts.json";
import content from "./fixtures/content.json";

type WithPath = { path: string };

/** App routes that aren't in the data (keep in sync with app/(store)). */
export const STATIC_PATHS = ["/", "/search", "/trade", "/_styleguide", "/blog/"];

export function fixturePaths(): Set<string> {
  const all = [products, categories, hubs, kits, posts, content] as WithPath[][];
  return new Set([...STATIC_PATHS, ...all.flatMap((list) => list.map((x) => x.path))]);
}
