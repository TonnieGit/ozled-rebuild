import type { z } from "zod";
import type * as S from "./schema";

export type StockStatus = z.infer<typeof S.StockStatus>;
export type Application = z.infer<typeof S.Application>;
export type LightFunction = z.infer<typeof S.LightFunction>;
export type MountStyle = z.infer<typeof S.MountStyle>;
export type Connector = z.infer<typeof S.Connector>;
export type ProductSpecs = z.infer<typeof S.ProductSpecs>;
export type DocumentKind = z.infer<typeof S.DocumentKind>;
export type ProductDocument = z.infer<typeof S.ProductDocument>;
export type Video = z.infer<typeof S.Video>;
export type Image = z.infer<typeof S.Image>;
export type Faq = z.infer<typeof S.Faq>;
export type Review = z.infer<typeof S.Review>;
export type ReviewSummary = z.infer<typeof S.ReviewSummary>;
export type Seo = z.infer<typeof S.Seo>;
export type Brand = z.infer<typeof S.Brand>;
export type Variant = z.infer<typeof S.Variant>;
export type Product = z.infer<typeof S.Product>;
export type Category = z.infer<typeof S.Category>;
export type ApplicationHub = z.infer<typeof S.ApplicationHub>;
export type Kit = z.infer<typeof S.Kit>;
export type KitStep = z.infer<typeof S.KitStep>;
export type Banner = z.infer<typeof S.Banner>;
export type BlogPost = z.infer<typeof S.BlogPost>;
export type ContentPage = z.infer<typeof S.ContentPage>;
export type Redirect = z.infer<typeof S.Redirect>;

/** What a product grid needs; keeps listing payloads small. */
export type ProductCard = Pick<
  Product,
  | "sku"
  | "path"
  | "name"
  | "brand"
  | "price"
  | "rrp"
  | "stock"
  | "restricted"
  | "applications"
  | "specs"
> & {
  images: Image[]; // main + lit view at most
  rating: Pick<ReviewSummary, "count" | "average">;
};

export type BlogPostCard = Omit<BlogPost, "bodyHtml">;

export type SortKey = "best" | "price-asc" | "price-desc" | "newest" | "rating";

export interface ListOpts {
  page?: number;
  pageSize?: number;
  sort?: SortKey;
  /** Filter key → accepted values (OR within a key, AND across keys). */
  filters?: Record<string, string[]>;
}

export interface FacetValue {
  value: string;
  label: string;
  count: number;
}

export interface Facet {
  key: string;
  label: string;
  values: FacetValue[];
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  facets?: Facet[];
}

export type ResolvedPath =
  | { type: "category"; id: string }
  | { type: "product"; sku: string }
  | { type: "hub"; path: string }
  | { type: "kit"; path: string }
  | { type: "content"; path: string }
  | { type: "post"; path: string };

/**
 * The only way components get data (SPEC §5). Lookups take exact legacy paths
 * so existing URLs keep working unchanged (SPEC §8.1, §13).
 */
export interface DataSource {
  /** Exact-match lookup of a URL path against the slug index. */
  resolvePath(path: string): Promise<ResolvedPath | null>;
  /** Every indexable path, for generateStaticParams and sitemaps. */
  listPaths(): Promise<{ path: string; type: ResolvedPath["type"]; updatedAt?: string }[]>;

  getProduct(path: string): Promise<Product | null>;
  getProductBySku(sku: string): Promise<Product | null>;
  getProductCards(skus: string[]): Promise<ProductCard[]>;
  /** Whole catalogue, e.g. best sellers on the homepage. */
  listProducts(opts: ListOpts): Promise<Page<ProductCard>>;
  getProductsByCategory(categoryId: string, opts: ListOpts): Promise<Page<ProductCard>>;
  getProductsByApplication(application: Application, opts: ListOpts): Promise<Page<ProductCard>>;

  getCategoryTree(): Promise<Category[]>;
  getCategory(path: string): Promise<Category | null>;
  getCategoryById(id: string): Promise<Category | null>;

  getApplicationHubs(): Promise<ApplicationHub[]>;
  getApplicationHub(path: string): Promise<ApplicationHub | null>;
  getKit(path: string): Promise<Kit | null>;

  getBanners(slot: Banner["slot"]): Promise<Banner[]>;
  getContentPage(path: string): Promise<ContentPage | null>;
  getBlogPosts(opts: ListOpts): Promise<Page<BlogPostCard>>;
  getBlogPost(path: string): Promise<BlogPost | null>;
  getRedirects(): Promise<Redirect[]>;
}
