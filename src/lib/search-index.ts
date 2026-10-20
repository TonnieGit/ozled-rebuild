import "server-only";
import { data } from "@/data";
import type { ProductCard } from "@/data/types";
import { prepare, search, type PreparedDoc, type SearchDoc } from "./search";

export interface ProductDoc extends SearchDoc {
  type: "product";
  card: ProductCard;
}

export type AnyDoc = ProductDoc | (SearchDoc & { type: "category" | "guide" | "hub" });

let cached: Promise<PreparedDoc<AnyDoc>[]> | null = null;

async function build(): Promise<PreparedDoc<AnyDoc>[]> {
  const [paths, categories, hubs, posts] = await Promise.all([
    data.listPaths(),
    data.getCategoryTree(),
    data.getApplicationHubs(),
    data.getBlogPosts({ pageSize: 500 }),
  ]);
  const catName = new Map(categories.map((c) => [c.id, c.name]));
  const productPaths = paths.filter((p) => p.type === "product").map((p) => p.path);
  const products = (await Promise.all(productPaths.map((p) => data.getProduct(p)))).filter((p) => p !== null);
  const cards = await data.getProductCards(products.map((p) => p.sku));
  const cardBySku = new Map(cards.map((c) => [c.sku, c]));

  const docs: AnyDoc[] = [
    ...products.map(
      (p): ProductDoc => ({
        id: p.sku,
        type: "product",
        title: p.name,
        path: p.path,
        keywords: [
          p.brand.name,
          p.sku,
          p.mpn ?? "",
          ...p.categoryIds.map((id) => catName.get(id) ?? ""),
          ...(p.specs.functions ?? []),
          p.specs.connector ?? "",
          p.specs.ipRating ?? "",
        ].join(" "),
        boost: 1 + Math.min(p.salesRank, 1000) / 5000,
        card: cardBySku.get(p.sku)!,
      }),
    ),
    ...categories.map((c) => ({ id: c.id, type: "category" as const, title: c.name, path: c.path, keywords: c.navLabel ?? "", boost: 1.2 })),
    ...hubs.map((h) => ({ id: h.path, type: "hub" as const, title: h.name, path: h.path, keywords: h.navLabel, boost: 1.3 })),
    ...posts.items.map((b) => ({ id: b.path, type: "guide" as const, title: b.title, path: b.path, keywords: b.tags.join(" ") })),
  ];
  return prepare(docs);
}

export async function searchAll(q: string) {
  cached ??= build();
  const hits = search(await cached, q, 60);
  return {
    products: hits.filter((h) => h.doc.type === "product").map((h) => (h.doc as ProductDoc).card),
    categories: hits.filter((h) => h.doc.type === "category" || h.doc.type === "hub").map((h) => ({ title: h.doc.title, path: h.doc.path })),
    guides: hits.filter((h) => h.doc.type === "guide").map((h) => ({ title: h.doc.title, path: h.doc.path })),
  };
}
