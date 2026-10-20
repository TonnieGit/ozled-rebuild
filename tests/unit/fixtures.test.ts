import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import {
  Category,
  Product,
  ApplicationHub,
  Kit,
  Banner,
  BlogPost,
  ContentPage,
  Redirect,
} from "../../src/data/schema";

const ROOT = path.resolve(__dirname, "../..");
const FIXTURES = path.join(ROOT, "src/data/fixtures");
const load = (file: string): unknown => JSON.parse(fs.readFileSync(path.join(FIXTURES, file), "utf8"));

const categories = z.array(Category).parse(load("categories.json"));
const products = z.array(Product).parse(load("products.json"));
const hubs = z.array(ApplicationHub).parse(load("hubs.json"));
const kits = z.array(Kit).parse(load("kits.json"));
const banners = z.array(Banner).parse(load("banners.json"));
const posts = z.array(BlogPost).parse(load("posts.json"));
const content = z.array(ContentPage).parse(load("content.json"));
const redirects = z.array(Redirect).parse(load("redirects.json"));

const categoryIds = new Set(categories.map((c) => c.id));
const skus = new Set(products.map((p) => p.sku));
const words = (s: string) => s.trim().split(/\s+/).length;

/** Every image referenced anywhere in the fixtures, with where it came from. */
function allImages(): { where: string; src: string }[] {
  const out: { where: string; src: string }[] = [];
  for (const p of products) for (const i of p.images) out.push({ where: p.sku, src: i.src });
  for (const c of categories) if (c.image) out.push({ where: c.id, src: c.image.src });
  for (const h of hubs) out.push({ where: h.path, src: h.heroImage.src });
  for (const k of kits) out.push({ where: k.path, src: k.heroImage.src });
  for (const b of banners) if (b.image) out.push({ where: b.id, src: b.image.desktop.src }, { where: b.id, src: b.image.mobile.src });
  for (const p of posts) {
    out.push({ where: p.path, src: p.image.src });
    for (const m of p.bodyHtml.matchAll(/<img[^>]+src="([^"]+)"/g)) out.push({ where: p.path, src: m[1] });
  }
  return out;
}

describe("fixtures: schema", () => {
  it("parse against the Zod schemas (top-level parse would have thrown)", () => {
    expect(categories.length).toBeGreaterThan(0);
    expect(products.length).toBeGreaterThanOrEqual(55);
    expect(hubs).toHaveLength(2);
    expect(kits).toHaveLength(2);
    expect(banners.filter((b) => b.slot === "home-hero")).toHaveLength(3);
    expect(banners.filter((b) => b.slot === "site-notice")).toHaveLength(1);
    expect(posts).toHaveLength(3);
    expect(content.length).toBeGreaterThanOrEqual(5);
    expect(redirects).toEqual([]);
  });

  it("site.json is an object with the core business facts", () => {
    const site = load("site.json") as Record<string, unknown>;
    expect(site).toMatchObject({ name: "OzLED", telephone: expect.any(String), email: expect.any(String) });
    expect(site.address).toMatchObject({ addressLocality: "Brendale", postalCode: "4500" });
  });
});

describe("fixtures: categories", () => {
  it("has the 10 'Shop by product' groups at the top level, in order", () => {
    const top = categories.filter((c) => c.parentId === null).sort((a, b) => a.sortOrder - b.sortOrder);
    expect(top.map((c) => c.navLabel ?? c.name)).toEqual([
      "Tail Lights",
      "Bulbs & Headlights",
      "Driving & Light Bars",
      "Work Lights",
      "Indicators & Markers",
      "Warning & Emergency",
      "Camping & Interior",
      "Wiring, Plugs & Switches",
      "Reverse Cameras",
      "BASE6",
    ]);
    for (const c of top) expect(c.onMenu).toBe(true);
  });

  it("every parentId exists and ids are unique", () => {
    expect(categoryIds.size).toBe(categories.length);
    for (const c of categories) if (c.parentId !== null) expect(categoryIds.has(c.parentId), c.id).toBe(true);
  });

  it("seo descriptions are 140–160 characters", () => {
    for (const c of categories) {
      expect(c.seo.description.length, c.id).toBeGreaterThanOrEqual(140);
      expect(c.seo.description.length, c.id).toBeLessThanOrEqual(160);
    }
  });
});

describe("fixtures: products", () => {
  it("every categoryId and primaryCategoryId exists", () => {
    for (const p of products) {
      expect(categoryIds.has(p.primaryCategoryId), `${p.sku} primary ${p.primaryCategoryId}`).toBe(true);
      expect(p.categoryIds, p.sku).toContain(p.primaryCategoryId);
      for (const id of p.categoryIds) expect(categoryIds.has(id), `${p.sku} → ${id}`).toBe(true);
    }
  });

  it("SKUs are unique and every compatibleWith SKU exists (and isn't itself)", () => {
    expect(skus.size).toBe(products.length);
    for (const p of products)
      for (const s of p.compatibleWith) {
        expect(skus.has(s), `${p.sku} → ${s}`).toBe(true);
        expect(s, p.sku).not.toBe(p.sku);
      }
  });

  it("every product has at least one image with non-empty alt, and the first is the main view", () => {
    for (const p of products) {
      expect(p.images.length, p.sku).toBeGreaterThanOrEqual(1);
      expect(p.images.length, p.sku).toBeLessThanOrEqual(6);
      for (const i of p.images) expect(i.alt.trim().length, p.sku).toBeGreaterThan(0);
      expect(p.images[0].view, p.sku).toBe("main");
    }
  });

  it("has at least 2 restricted (red/blue) products", () => {
    expect(products.filter((p) => p.restricted).length).toBeGreaterThanOrEqual(2);
  });

  it("summaries are 40–60 words, 3–6 features, seo within limits", () => {
    for (const p of products) {
      expect(words(p.summary), p.sku).toBeGreaterThanOrEqual(40);
      expect(words(p.summary), p.sku).toBeLessThanOrEqual(60);
      expect(p.features.length, p.sku).toBeGreaterThanOrEqual(3);
      expect(p.features.length, p.sku).toBeLessThanOrEqual(6);
      expect(p.seo.description.length, p.sku).toBeGreaterThanOrEqual(140);
      expect(p.seo.description.length, p.sku).toBeLessThanOrEqual(160);
    }
  });

  it("descriptions contain no scripts, styles, iframes, h1s or document links", () => {
    for (const p of products) {
      expect(p.descriptionHtml, p.sku).not.toMatch(/<(script|style|iframe|h1|font|img)\b/i);
      expect(p.descriptionHtml, p.sku).not.toMatch(/style="/i);
      expect(p.descriptionHtml, p.sku).not.toMatch(/\.pdf/i);
    }
  });

  it("reviews are empty (no TrustSpot data is available without an API key)", () => {
    for (const p of products) {
      expect(p.reviews.items).toEqual([]);
      expect(p.reviews.summary.count).toBe(0);
    }
  });

  it("documents point at absolute URLs and videos have YouTube ids", () => {
    for (const p of products) {
      for (const d of p.documents) expect(d.url, p.sku).toMatch(/^https?:\/\//);
      for (const v of p.videos) expect(v.youtubeId, p.sku).toMatch(/^[A-Za-z0-9_-]{11}$/);
    }
  });
});

describe("fixtures: hubs and kits", () => {
  it("every hub featuredKitPath exists in kits", () => {
    const kitPaths = new Set(kits.map((k) => k.path));
    for (const h of hubs) if (h.featuredKitPath) expect(kitPaths.has(h.featuredKitPath), h.path).toBe(true);
  });

  it("every kit candidate SKU exists", () => {
    for (const k of kits) for (const s of k.steps) for (const sku of s.candidateSkus) expect(skus.has(sku), `${k.path} ${s.id} → ${sku}`).toBe(true);
  });

  it("hub related posts exist and related categories are real category paths", () => {
    const postPaths = new Set(posts.map((p) => p.path));
    const catPaths = new Set(categories.map((c) => c.path));
    for (const h of hubs) {
      for (const p of h.relatedPostPaths) expect(postPaths.has(p), `${h.path} → ${p}`).toBe(true);
      for (const p of h.relatedCategoryPaths) expect(catPaths.has(p), `${h.path} → ${p}`).toBe(true);
      for (const c of h.checklist) expect(catPaths.has(c.href.split("?")[0]), `${h.path} checklist → ${c.href}`).toBe(true);
      expect(words(h.summary), h.path).toBeGreaterThanOrEqual(40);
      expect(words(h.summary), h.path).toBeLessThanOrEqual(60);
    }
  });
});

describe("fixtures: integrity across files", () => {
  it("all paths are unique across products, categories, hubs, kits, posts and content", () => {
    const all = [
      ...products.map((p) => p.path),
      ...categories.map((c) => c.path),
      ...hubs.map((h) => h.path),
      ...kits.map((k) => k.path),
      ...posts.map((p) => p.path),
      ...content.map((c) => c.path),
    ];
    const dupes = all.filter((p, i) => all.indexOf(p) !== i);
    expect(dupes).toEqual([]);
  });

  it("every referenced image file exists on disk under public/", () => {
    const missing = allImages().filter((i) => !fs.existsSync(path.join(ROOT, "public", i.src)));
    expect(missing).toEqual([]);
  });

  it("banner CTAs point at fixture paths", () => {
    const known = new Set([...categories.map((c) => c.path), ...hubs.map((h) => h.path), ...kits.map((k) => k.path), ...content.map((c) => c.path)]);
    for (const b of banners) if (b.ctaUrl) expect(known.has(b.ctaUrl), `${b.id} → ${b.ctaUrl}`).toBe(true);
  });
});
