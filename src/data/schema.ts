/**
 * Normalised storefront data model (SPEC §5).
 *
 * Every DataSource implementation must return data that passes these schemas.
 * Fixtures are validated in tests; the Neto adapter validates at the API boundary.
 * Money is AUD, GST inclusive, in dollars (e.g. 89.95). Lengths are millimetres.
 * Paths are exact legacy URL paths: leading slash, original case, original
 * trailing-slash convention (e.g. "/led-tail-lights/" vs "/led-autolamps-tail-light-maxilamp-3-series").
 */
import { z } from "zod";

export const Path = z.string().regex(/^\/[^\s?#]*$/, "path must start with / and have no query");

export const StockStatus = z.enum(["in_stock", "low", "backorder", "out"]);

export const Application = z.enum([
  "ute-tray",
  "trailer",
  "truck",
  "4wd",
  "caravan",
  "marine",
  "emergency",
]);

export const LightFunction = z.enum([
  "stop",
  "tail",
  "indicator",
  "reverse",
  "fog",
  "licence-plate",
  "marker",
  "reflector",
  "drl",
  "work",
  "driving",
  "warning",
  "interior",
  "scene",
]);

export const MountStyle = z.enum([
  "horizontal",
  "vertical",
  "surface",
  "recessed",
  "flush",
  "bracket",
  "pedestal",
  "magnetic",
  "bolt",
]);

/** Connector on the product itself, or vehicle socket type for plugs/sockets. */
export const Connector = z.enum([
  "bare-wire",
  "plug-and-play",
  "deutsch",
  "superseal",
  "7-pin-flat",
  "7-pin-round",
  "12-pin-flat",
  "12-pin-round",
  "anderson",
  "cigarette",
  "usb",
  "other",
]);

export const Beam = z.enum(["spot", "flood", "combo", "driving", "fog", "wide", "pencil"]);

export const ProductSpecs = z.object({
  voltage: z.object({ min: z.number(), max: z.number() }).optional(),
  wattage: z.number().optional(),
  lumens: z.number().optional(),
  /** e.g. "IP67", "IP69K" */
  ipRating: z.string().regex(/^IP[0-9X][0-9X]K?$/).optional(),
  dimensionsMm: z
    .object({
      length: z.number().optional(),
      width: z.number().optional(),
      depth: z.number().optional(),
      diameter: z.number().optional(),
    })
    .optional(),
  ledCount: z.number().int().optional(),
  functions: z.array(LightFunction).optional(),
  mount: z.array(MountStyle).optional(),
  connector: Connector.optional(),
  beam: Beam.optional(),
  /** ADR approval text exactly as it should be quoted, e.g. "ADR 6/00, 13/00 — Cat. 6, 7, 11" */
  adrApprovals: z.array(z.string()).optional(),
  warrantyYears: z.number().optional(),
  cableLengthMm: z.number().optional(),
  housing: z.string().optional(),
  lensColour: z.string().optional(),
  lightColour: z.string().optional(),
  /** Anything else worth showing, as plain label/value text. */
  extra: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
});

export const DocumentKind = z.enum([
  "datasheet",
  "fitting-instructions",
  "wiring-diagram",
  "adr-certificate",
  "flash-patterns",
  "warranty",
  "brochure",
  "other",
]);

export const ProductDocument = z.object({
  kind: DocumentKind,
  title: z.string(),
  url: z.string(),
  fileType: z.enum(["pdf", "image", "web"]),
  sizeKb: z.number().optional(),
});

export const Video = z.object({
  youtubeId: z.string(),
  title: z.string(),
});

export const ImageView = z.enum(["main", "lit", "detail", "installed", "packaging", "diagram"]);

export const Image = z.object({
  src: z.string(),
  alt: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  view: ImageView.optional(),
});

export const Faq = z.object({ question: z.string(), answer: z.string() });

export const Review = z.object({
  id: z.string(),
  author: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  body: z.string(),
  date: z.string(),
  verified: z.boolean(),
});

export const ReviewSummary = z.object({
  count: z.number().int().nonnegative(),
  average: z.number().min(0).max(5),
  /** counts for 1★..5★ */
  distribution: z.tuple([z.number(), z.number(), z.number(), z.number(), z.number()]),
});

export const Seo = z.object({
  title: z.string().max(60),
  description: z.string().max(170),
});

export const Brand = z.object({
  name: z.string(),
  path: Path.optional(),
});

export const Variant = z.object({
  sku: z.string(),
  label: z.string(),
  options: z.record(z.string(), z.string()),
  price: z.number(),
  stock: StockStatus,
});

export const Product = z.object({
  sku: z.string(),
  parentSku: z.string().optional(),
  path: Path,
  name: z.string(),
  brand: Brand,
  price: z.number().positive(),
  rrp: z.number().positive().optional(),
  images: z.array(Image).min(1),
  stock: StockStatus,
  pickupAvailable: z.boolean(),
  specs: ProductSpecs,
  applications: z.array(Application),
  /** SKUs of plugs, brackets, resistors etc. that work with this product. */
  compatibleWith: z.array(z.string()),
  restricted: z.boolean(),
  /** 40–60 word answer-first paragraph (SPEC §9). Plain text. */
  summary: z.string(),
  /** Short scannable feature bullets. Plain text. */
  features: z.array(z.string()),
  /** Remaining long-form description. Sanitised HTML, no specs/documents in it. */
  descriptionHtml: z.string(),
  documents: z.array(ProductDocument),
  videos: z.array(Video),
  faqs: z.array(Faq),
  reviews: z.object({ summary: ReviewSummary, items: z.array(Review) }),
  variants: z.array(Variant).optional(),
  primaryCategoryId: z.string(),
  categoryIds: z.array(z.string()).min(1),
  gtin: z.string().optional(),
  mpn: z.string().optional(),
  seo: Seo,
  /** Higher sells more; drives "Best selling" sort. */
  salesRank: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const Category = z.object({
  id: z.string(),
  parentId: z.string().nullable(),
  name: z.string(),
  /** Shorter label for menus, if different from name. */
  navLabel: z.string().optional(),
  path: Path,
  /** 1–2 sentence answer-first intro shown above the grid. Plain text. */
  intro: z.string(),
  /** Long-form copy shown below the grid. Sanitised HTML. */
  bodyHtml: z.string(),
  faqs: z.array(Faq),
  image: Image.optional(),
  onMenu: z.boolean(),
  sortOrder: z.number(),
  seo: Seo,
});

export const ChecklistItem = z.object({
  label: z.string(),
  description: z.string(),
  required: z.boolean(),
  /** Category path to link to, optionally with filter query params. */
  href: z.string(),
});

export const ApplicationHub = z.object({
  path: Path,
  application: Application,
  name: z.string(),
  navLabel: z.string(),
  /** 40–60 word answer-first summary. Plain text. */
  summary: z.string(),
  heroImage: Image,
  checklist: z.array(ChecklistItem),
  featuredKitPath: Path.optional(),
  /** Category paths that already rank for the hub's core term; link, don't cannibalise. */
  relatedCategoryPaths: z.array(Path),
  adrExplainerHtml: z.string(),
  faqs: z.array(Faq).min(5).max(8),
  relatedPostPaths: z.array(Path),
  seo: Seo,
});

export const KitStep = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  candidateSkus: z.array(z.string()).min(1),
  required: z.boolean(),
  /** How many of the chosen item go in the kit (e.g. tail lights come as 2 singles). */
  defaultQty: z.number().int().positive(),
  /** Spec keys shoppers can filter this step by. */
  filterKeys: z.array(z.string()),
});

export const Kit = z.object({
  path: Path,
  name: z.string(),
  application: Application,
  summary: z.string(),
  heroImage: Image,
  steps: z.array(KitStep).min(2),
  seo: Seo,
});

export const Banner = z.object({
  id: z.string(),
  slot: z.enum(["home-hero", "site-notice"]),
  headline: z.string(),
  subhead: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaUrl: z.string().optional(),
  image: z
    .object({ desktop: Image, mobile: Image })
    .optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  sortOrder: z.number(),
});

export const Author = z.object({ name: z.string(), role: z.string() });

export const BlogPost = z.object({
  path: Path,
  title: z.string(),
  excerpt: z.string(),
  image: Image,
  author: Author,
  publishedAt: z.string(),
  reviewedAt: z.string(),
  tags: z.array(z.string()),
  bodyHtml: z.string(),
  seo: Seo,
});

export const ContentPage = z.object({
  path: Path,
  title: z.string(),
  summary: z.string().optional(),
  bodyHtml: z.string(),
  seo: Seo,
  updatedAt: z.string(),
});

export const Redirect = z.object({
  from: Path,
  to: z.string(),
  status: z.union([z.literal(301), z.literal(308)]),
});
