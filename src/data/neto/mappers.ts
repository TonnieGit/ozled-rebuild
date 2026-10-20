/**
 * Neto JSON → normalised types (SPEC §5). Neto returns most values as strings
 * and omits empty fields, so every input is parsed loosely and every output is
 * validated strictly with the shared schemas. UNTESTED against live API output.
 */
import { z } from "zod";
import * as S from "../schema";
import type { Category, ContentPage, Product, ProductDocument, ProductSpecs, StockStatus } from "../types";
import { CUSTOM_FIELDS, LOW_STOCK_THRESHOLD, PICKUP_WAREHOUSE_ID } from "./selectors";

const str = z.union([z.string(), z.number()]).transform(String).optional();
const num = z
  .union([z.string(), z.number()])
  .transform((v) => Number(v))
  .optional();
const bool = z
  .union([z.string(), z.boolean()])
  .transform((v) => v === true || v === "True" || v === "true" || v === "1")
  .optional();
const many = <T extends z.ZodTypeAny>(t: T) =>
  z
    .union([z.array(t), t])
    .transform((v) => (Array.isArray(v) ? v : [v]))
    .optional();

export const NetoItem = z
  .object({
    SKU: z.string(),
    ParentSKU: str,
    Name: z.string(),
    Brand: str,
    Model: str,
    ItemURL: str,
    IsActive: bool,
    Approved: bool,
    DefaultPrice: num,
    RRP: num,
    PromotionPrice: num,
    AvailableSellQuantity: num,
    WarehouseQuantity: many(z.object({ WarehouseID: str, Quantity: num }).passthrough()),
    Images: many(z.object({ URL: z.string(), Name: str }).passthrough()),
    Categories: many(
      z.object({ Category: many(z.object({ CategoryID: str, Priority: num }).passthrough()) }).passthrough(),
    ),
    Description: str,
    ShortDescription: str,
    Features: str,
    CrossSellProducts: many(z.object({ CrossSellProduct: many(z.object({ SKU: str }).passthrough()) }).passthrough()),
    UPC: str,
    SEOPageTitle: str,
    SEOMetaDescription: str,
    DateAdded: str,
    DateUpdated: str,
  })
  .catchall(z.unknown());

export const NetoCategory = z
  .object({
    CategoryID: z.union([z.string(), z.number()]).transform(String),
    CategoryName: z.string(),
    ParentCategoryID: str,
    CategoryURL: str,
    Active: bool,
    OnMenu: bool,
    SortOrder: num,
    Description1: str,
    SEOPageTitle: str,
    SEOMetaDescription: str,
  })
  .catchall(z.unknown());

export const NetoContent = z
  .object({
    ContentID: z.union([z.string(), z.number()]).transform(String),
    ContentName: z.string(),
    ContentType: str,
    ContentURL: str,
    Active: bool,
    SortOrder: num,
    Description1: str,
    ShortDescription1: str,
    Author: str,
    DatePosted: str,
    DateUpdated: str,
    SEOPageTitle: str,
    SEOMetaDescription: str,
  })
  .catchall(z.unknown());

/** "https://www.ozled.com.au/foo/" → "/foo/" (exact path kept, SPEC §8.1). */
export function toPath(url: string | undefined): string {
  if (!url) return "/";
  try {
    return new URL(url, "https://www.ozled.com.au").pathname;
  } catch {
    return url.startsWith("/") ? url : `/${url}`;
  }
}

export function stockStatus(qty: number | undefined): StockStatus {
  if (qty === undefined || qty <= 0) return "out";
  return qty <= LOW_STOCK_THRESHOLD ? "low" : "in_stock";
}

function parseJson<T>(raw: unknown, schema: z.ZodType<T>, fallback: T): T {
  if (typeof raw !== "string" || !raw.trim()) return fallback;
  try {
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : fallback;
  } catch {
    return fallback;
  }
}

export function clip(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function mapItem(raw: unknown): Product | null {
  const parsed = NetoItem.safeParse(raw);
  if (!parsed.success) return null;
  const i = parsed.data;
  if (i.IsActive === false || i.Approved === false) return null;

  const specs = parseJson<ProductSpecs>(i[CUSTOM_FIELDS.specs], S.ProductSpecs, {});
  const documents = parseJson<ProductDocument[]>(i[CUSTOM_FIELDS.documents], z.array(S.ProductDocument), []);
  const applications = String(i[CUSTOM_FIELDS.applications] ?? "")
    .split(",")
    .map((a) => a.trim())
    .filter((a): a is Product["applications"][number] => S.Application.safeParse(a).success);
  const videos = String(i[CUSTOM_FIELDS.videos] ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .map((youtubeId) => ({ youtubeId, title: i.Name }));

  const categoryRefs = (i.Categories ?? []).flatMap((c) => c.Category ?? []);
  const categoryIds = categoryRefs.map((c) => c.CategoryID).filter((id): id is string => Boolean(id));
  const primary = [...categoryRefs].sort((a, b) => (a.Priority ?? 99) - (b.Priority ?? 99))[0]?.CategoryID;
  const pickupQty = (i.WarehouseQuantity ?? []).find((w) => w.WarehouseID === PICKUP_WAREHOUSE_ID)?.Quantity ?? 0;
  const description = i.Description ?? "";
  const summary = stripHtml(i.ShortDescription || description).split(" ").slice(0, 60).join(" ");

  const product = {
    sku: i.SKU,
    parentSku: i.ParentSKU || undefined,
    path: toPath(i.ItemURL),
    name: i.Name,
    brand: { name: i.Brand || "OzLED" },
    price: i.PromotionPrice || i.DefaultPrice || 0,
    rrp: i.RRP || undefined,
    images: (i.Images ?? []).map((img, n) => ({
      src: img.URL,
      alt: `${i.Name} – ${n === 0 ? "main view" : `view ${n + 1}`}`,
      width: 1000,
      height: 1000,
      view: n === 0 ? ("main" as const) : undefined,
    })),
    stock: stockStatus(i.AvailableSellQuantity),
    pickupAvailable: pickupQty > 0,
    specs,
    applications,
    compatibleWith: (i.CrossSellProducts ?? [])
      .flatMap((c) => c.CrossSellProduct ?? [])
      .map((c) => c.SKU)
      .filter((s): s is string => Boolean(s)),
    restricted: i[CUSTOM_FIELDS.restricted] === "1",
    summary,
    features: stripHtml(i.Features ?? "")
      .split(/\s*[•\n]\s*/)
      .filter(Boolean)
      .slice(0, 6),
    descriptionHtml: description,
    documents,
    videos,
    faqs: [],
    reviews: { summary: { count: 0, average: 0, distribution: [0, 0, 0, 0, 0] as [number, number, number, number, number] }, items: [] },
    primaryCategoryId: primary ?? categoryIds[0] ?? "uncategorised",
    categoryIds: categoryIds.length ? categoryIds : ["uncategorised"],
    gtin: i.UPC || undefined,
    mpn: i.Model || undefined,
    seo: {
      title: clip(`${i.SEOPageTitle || i.Name} | OzLED`, 60),
      description: clip(i.SEOMetaDescription || summary, 160),
    },
    salesRank: 0,
    createdAt: i.DateAdded ?? new Date(0).toISOString(),
    updatedAt: i.DateUpdated ?? new Date(0).toISOString(),
  };
  const ok = S.Product.safeParse(product);
  return ok.success ? ok.data : null;
}

export function mapCategory(raw: unknown): Category | null {
  const parsed = NetoCategory.safeParse(raw);
  if (!parsed.success || parsed.data.Active === false) return null;
  const c = parsed.data;
  const [intro = "", rest = ""] = (c.Description1 ?? "").split("<!--intro-->");
  const [body, faqHtml = ""] = (rest || intro).split("<!--faq-->");
  const faqs = [...faqHtml.matchAll(/<h3[^>]*>(.*?)<\/h3>\s*([\s\S]*?)(?=<h3|$)/g)].map((m) => ({
    question: stripHtml(m[1]),
    answer: stripHtml(m[2]),
  }));
  const category = {
    id: c.CategoryID,
    parentId: c.ParentCategoryID && c.ParentCategoryID !== "0" ? c.ParentCategoryID : null,
    name: c.CategoryName,
    path: toPath(c.CategoryURL),
    intro: rest ? stripHtml(intro) : "",
    bodyHtml: body ?? "",
    faqs,
    onMenu: c.OnMenu ?? false,
    sortOrder: c.SortOrder ?? 0,
    seo: {
      title: clip(`${c.SEOPageTitle || c.CategoryName} | OzLED`, 60),
      description: clip(c.SEOMetaDescription || stripHtml(body ?? ""), 160),
    },
  };
  const ok = S.Category.safeParse(category);
  return ok.success ? ok.data : null;
}

export function mapContentPage(raw: unknown): ContentPage | null {
  const parsed = NetoContent.safeParse(raw);
  if (!parsed.success || parsed.data.Active === false) return null;
  const c = parsed.data;
  const page = {
    path: toPath(c.ContentURL),
    title: c.ContentName,
    summary: c.ShortDescription1 ? stripHtml(c.ShortDescription1) : undefined,
    bodyHtml: c.Description1 ?? "",
    seo: {
      title: clip(`${c.SEOPageTitle || c.ContentName} | OzLED`, 60),
      description: clip(c.SEOMetaDescription || stripHtml(c.Description1 ?? ""), 160),
    },
    updatedAt: c.DateUpdated ?? new Date(0).toISOString(),
  };
  const ok = S.ContentPage.safeParse(page);
  return ok.success ? ok.data : null;
}
