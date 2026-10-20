import { describe, expect, it } from "vitest";
import { listCards, parseListParams, toQuery } from "../../src/data/facets";
import type { ProductCard } from "../../src/data/types";

const card = (sku: string, over: Partial<ProductCard> & { _rank?: number } = {}): ProductCard & { _rank: number; _new: string } => ({
  sku,
  path: `/${sku}`,
  name: sku,
  brand: { name: "LED Autolamps" },
  price: 50,
  stock: "in_stock",
  restricted: false,
  applications: ["ute-tray"],
  specs: {},
  images: [{ src: "/x.webp", alt: sku, width: 1, height: 1 }],
  rating: { count: 0, average: 0 },
  _rank: over._rank ?? 0,
  _new: "2026-01-01",
  ...over,
});

const cards = [
  card("A", { price: 30, specs: { voltage: { min: 12, max: 24 }, functions: ["stop", "tail"] }, _rank: 5 }),
  card("B", { price: 80, specs: { voltage: { min: 12, max: 12 }, functions: ["stop", "tail", "indicator"] }, applications: ["trailer"], _rank: 9 }),
  card("C", { price: 300, stock: "out", specs: { voltage: { min: 24, max: 24 } }, brand: { name: "BASE6" }, _rank: 1 }),
];

describe("listCards", () => {
  it("sorts best sellers by rank by default", () => {
    expect(listCards(cards, {}).items.map((c) => c.sku)).toEqual(["B", "A", "C"]);
  });
  it("sorts by price", () => {
    expect(listCards(cards, { sort: "price-asc" }).items.map((c) => c.sku)).toEqual(["A", "B", "C"]);
  });
  it("ORs within a facet and ANDs across facets", () => {
    expect(listCards(cards, { filters: { voltage: ["24v"] } }).items.map((c) => c.sku).sort()).toEqual(["A", "C"]);
    expect(listCards(cards, { filters: { voltage: ["24v"], stock: ["in-stock"] } }).items.map((c) => c.sku)).toEqual(["A"]);
    expect(listCards(cards, { filters: { application: ["ute-tray", "trailer"] } }).total).toBe(3);
  });
  it("12–24V lights count for 12V and 24V filters", () => {
    expect(listCards(cards, { filters: { voltage: ["12v"] } }).items.map((c) => c.sku).sort()).toEqual(["A", "B"]);
  });
  it("facet counts ignore their own selection", () => {
    const page = listCards(cards, { filters: { brand: ["base6"] } });
    const brand = page.facets!.find((f) => f.key === "brand")!;
    expect(brand.values.map((v) => v.value).sort()).toEqual(["base6", "led-autolamps"]);
  });
  it("paginates", () => {
    const p2 = listCards(cards, { pageSize: 2, page: 2 });
    expect(p2.items).toHaveLength(1);
    expect(p2.total).toBe(3);
  });
  it("strips internal ranking fields", () => {
    expect(Object.keys(listCards(cards, {}).items[0])).not.toContain("_rank");
  });
});

describe("query params", () => {
  it("round-trips filters, sort and page", () => {
    const opts = parseListParams({ voltage: "24v,12v", sort: "price-asc", page: "2", junk: "x" });
    expect(opts).toEqual({ filters: { voltage: ["24v", "12v"] }, sort: "price-asc", page: 2 });
    expect(toQuery(opts)).toBe("?voltage=12v%2C24v&sort=price-asc&page=2");
  });
  it("ignores invalid sort and page", () => {
    expect(parseListParams({ sort: "nope", page: "-3" })).toEqual({ filters: {}, sort: undefined, page: 1 });
  });
});
