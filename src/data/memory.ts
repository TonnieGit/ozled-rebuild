/**
 * In-memory DataSource over a complete normalised dataset. Used directly by
 * fixtures, and by the Neto adapter over a cached catalogue snapshot, so both
 * sources resolve paths, filter and sort identically.
 */
import { listCards } from "./facets";
import type { DataSource, ProductCard, Product, ResolvedPath, BlogPostCard, Category, ApplicationHub, Kit, Banner, BlogPost, ContentPage, Redirect } from "./types";

export interface Dataset {
  products: Product[];
  categories: Category[];
  hubs: ApplicationHub[];
  kits: Kit[];
  banners: Banner[];
  posts: BlogPost[];
  content: ContentPage[];
  redirects: Redirect[];
}

export function toCard(p: Product): ProductCard & { _rank: number; _new: string } {
  return {
    sku: p.sku,
    path: p.path,
    name: p.name,
    brand: p.brand,
    price: p.price,
    rrp: p.rrp,
    stock: p.stock,
    restricted: p.restricted,
    applications: p.applications,
    specs: p.specs,
    images: [p.images[0], ...p.images.filter((i) => i.view === "lit").slice(0, 1)],
    rating: { count: p.reviews.summary.count, average: p.reviews.summary.average },
    _rank: p.salesRank,
    _new: p.createdAt,
  };
}

export function createMemorySource(ds: Dataset): DataSource {
  const { products, categories, hubs, kits, banners, posts, content, redirects } = ds;
  const bySku = new Map(products.map((p) => [p.sku, p]));
  const byPath = new Map<string, ResolvedPath>();
  for (const c of categories) byPath.set(c.path, { type: "category", id: c.id });
  for (const p of products) byPath.set(p.path, { type: "product", sku: p.sku });
  for (const h of hubs) byPath.set(h.path, { type: "hub", path: h.path });
  for (const k of kits) byPath.set(k.path, { type: "kit", path: k.path });
  for (const c of content) byPath.set(c.path, { type: "content", path: c.path });
  for (const b of posts) byPath.set(b.path, { type: "post", path: b.path });

  /** Category id → itself plus every descendant id, so a parent lists its children's products. */
  const descendants = new Map<string, Set<string>>();
  for (const c of categories) {
    const set = new Set([c.id]);
    const stack = [c.id];
    while (stack.length) {
      const id = stack.pop()!;
      for (const child of categories) {
        if (child.parentId === id && !set.has(child.id)) {
          set.add(child.id);
          stack.push(child.id);
        }
      }
    }
    descendants.set(c.id, set);
  }

  const allCards = products.map(toCard);

  const postCard = ({ bodyHtml: _b, ...rest }: BlogPost): BlogPostCard => {
    void _b;
    return rest;
  };

  return {
    async resolvePath(path) {
      return byPath.get(path) ?? null;
    },
    async listPaths() {
      return [
        ...categories.map((c) => ({ path: c.path, type: "category" as const })),
        ...products.map((p) => ({ path: p.path, type: "product" as const, updatedAt: p.updatedAt })),
        ...hubs.map((h) => ({ path: h.path, type: "hub" as const })),
        ...kits.map((k) => ({ path: k.path, type: "kit" as const })),
        ...content.map((c) => ({ path: c.path, type: "content" as const, updatedAt: c.updatedAt })),
        ...posts.map((b) => ({ path: b.path, type: "post" as const, updatedAt: b.reviewedAt })),
      ];
    },

    async getProduct(path) {
      const r = byPath.get(path);
      return r?.type === "product" ? (bySku.get(r.sku) ?? null) : null;
    },
    async getProductBySku(sku) {
      return bySku.get(sku) ?? null;
    },
    async getProductCards(skus) {
      return skus.flatMap((s) => {
        const p = bySku.get(s);
        if (!p) return [];
        const { _rank: _r, _new: _n, ...card } = toCard(p);
        void _r;
        void _n;
        return [card];
      });
    },
    async listProducts(opts) {
      return listCards(allCards, opts);
    },
    async getProductsByCategory(categoryId, opts) {
      const ids = descendants.get(categoryId) ?? new Set([categoryId]);
      const cards = allCards.filter((c) => bySku.get(c.sku)!.categoryIds.some((id) => ids.has(id)));
      return listCards(cards, opts);
    },
    async getProductsByApplication(application, opts) {
      return listCards(
        allCards.filter((c) => c.applications.includes(application)),
        opts,
      );
    },

    async getCategoryTree() {
      return [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
    },
    async getCategory(path) {
      const r = byPath.get(path);
      return r?.type === "category" ? (categories.find((c) => c.id === r.id) ?? null) : null;
    },
    async getCategoryById(id) {
      return categories.find((c) => c.id === id) ?? null;
    },

    async getApplicationHubs() {
      return hubs;
    },
    async getApplicationHub(path) {
      return hubs.find((h) => h.path === path) ?? null;
    },
    async getKit(path) {
      return kits.find((k) => k.path === path) ?? null;
    },

    async getBanners(slot) {
      const now = new Date().toISOString();
      return banners
        .filter((b) => b.slot === slot)
        .filter((b) => (!b.startsAt || b.startsAt <= now) && (!b.endsAt || b.endsAt >= now))
        .sort((a, b) => a.sortOrder - b.sortOrder);
    },
    async getContentPage(path) {
      return content.find((c) => c.path === path) ?? null;
    },
    async getBlogPosts(opts) {
      const pageSize = opts.pageSize ?? 12;
      const page = Math.max(1, opts.page ?? 1);
      const sorted = [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
      return {
        items: sorted.slice((page - 1) * pageSize, page * pageSize).map(postCard),
        total: sorted.length,
        page,
        pageSize,
      };
    },
    async getBlogPost(path) {
      return posts.find((p) => p.path === path) ?? null;
    },
    async getRedirects() {
      return redirects;
    },
  };
}
