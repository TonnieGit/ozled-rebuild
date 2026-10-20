import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createMemorySource, type Dataset } from "../memory";
import type { DataSource } from "../types";
import { netoGetAll } from "./client";
import { CATEGORY_SELECTORS, CONTENT_SELECTORS, ITEM_SELECTORS } from "./selectors";
import { mapCategory, mapContentPage, mapItem } from "./mappers";
import { fixtures } from "../fixtures";

/**
 * Neto DataSource (Phase 4). Loads a full catalogue snapshot, caches it for an
 * hour with tag "catalogue" (revalidated by Neto webhooks via /api/revalidate),
 * and serves it through the same in-memory source as fixtures.
 *
 * Hubs, kits and banners have no Neto home yet (custom content types are a VERIFY,
 * SPEC §4.3), so they fall back to fixtures until those content types exist.
 */
export const CATALOGUE_TAG = "catalogue";

async function loadDataset(): Promise<Dataset> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOGUE_TAG);

  const [items, cats, pages] = await Promise.all([
    netoGetAll<unknown>("GetItem", "Item", { IsActive: ["True"], Approved: ["True"], OutputSelector: ITEM_SELECTORS }),
    netoGetAll<unknown>("GetCategory", "Category", { Active: ["True"], OutputSelector: CATEGORY_SELECTORS }),
    netoGetAll<unknown>("GetContent", "Content", { Active: ["True"], OutputSelector: CONTENT_SELECTORS }),
  ]);

  const [hubs, kits, banners, blog] = await Promise.all([
    fixtures.getApplicationHubs(),
    Promise.all(["/kits/ute-tray-lighting/", "/kits/trailer-lighting/"].map((p) => fixtures.getKit(p))),
    Promise.all([fixtures.getBanners("home-hero"), fixtures.getBanners("site-notice")]),
    fixtures.getBlogPosts({ pageSize: 100 }),
  ]);
  const posts = (await Promise.all(blog.items.map((b) => fixtures.getBlogPost(b.path)))).filter((p) => p !== null);

  return {
    products: items.map(mapItem).filter((p) => p !== null),
    categories: cats.map(mapCategory).filter((c) => c !== null),
    content: pages.map(mapContentPage).filter((c) => c !== null),
    hubs,
    kits: kits.filter((k) => k !== null),
    banners: banners.flat(),
    posts,
    redirects: [],
  };
}

async function source(): Promise<DataSource> {
  return createMemorySource(await loadDataset());
}

/** Every method delegates to a source built over the cached snapshot. */
export const neto: DataSource = new Proxy({} as DataSource, {
  get(_t, method: keyof DataSource) {
    return async (...args: unknown[]) => {
      const s = await source();
      return (s[method] as (...a: unknown[]) => unknown)(...args);
    };
  },
});
