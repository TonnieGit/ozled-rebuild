/**
 * Filtering, faceting and sorting over product cards. Pure functions so the
 * fixtures source and (later) a search-backed source share the same buyer-language
 * filters (SPEC §7.4). Internal attributes never become facets.
 */
import type { Facet, ListOpts, Page, ProductCard, SortKey } from "./types";

export const DEFAULT_PAGE_SIZE = 24;

const APPLICATION_LABELS: Record<string, string> = {
  "ute-tray": "Ute & tray",
  trailer: "Trailer",
  truck: "Truck",
  "4wd": "4WD & touring",
  caravan: "Caravan & RV",
  marine: "Marine",
  emergency: "Emergency & fleet",
};

const FUNCTION_LABELS: Record<string, string> = {
  stop: "Stop",
  tail: "Tail",
  indicator: "Indicator",
  reverse: "Reverse",
  fog: "Fog",
  "licence-plate": "Licence plate",
  marker: "Marker",
  reflector: "Reflector",
  drl: "Daytime running",
  work: "Work",
  driving: "Driving",
  warning: "Warning",
  interior: "Interior",
  scene: "Scene",
};

const MOUNT_LABELS: Record<string, string> = {
  horizontal: "Horizontal",
  vertical: "Vertical",
  surface: "Surface",
  recessed: "Recessed",
  flush: "Flush",
  bracket: "Bracket",
  pedestal: "Pedestal",
  magnetic: "Magnetic",
  bolt: "Bolt-on",
};

const CONNECTOR_LABELS: Record<string, string> = {
  "bare-wire": "Bare wire",
  "plug-and-play": "Plug & play",
  deutsch: "Deutsch",
  superseal: "Superseal",
  "7-pin-flat": "7-pin flat",
  "7-pin-round": "7-pin round",
  "12-pin-flat": "12-pin flat",
  "12-pin-round": "12-pin round",
  anderson: "Anderson",
  cigarette: "Cigarette socket",
  usb: "USB",
  other: "Other",
};

const PRICE_BANDS: [string, string, number, number][] = [
  ["0-50", "Under $50", 0, 50],
  ["50-100", "$50 – $100", 50, 100],
  ["100-250", "$100 – $250", 100, 250],
  ["250-500", "$250 – $500", 250, 500],
  ["500+", "$500+", 500, Infinity],
];

function voltageKeys(card: ProductCard): string[] {
  const v = card.specs.voltage;
  if (!v) return [];
  const keys: string[] = [];
  if (v.min <= 12 && v.max >= 12) keys.push("12v");
  if (v.min <= 24 && v.max >= 24) keys.push("24v");
  if (v.min <= 12 && v.max >= 24) keys.push("12-24v");
  if (v.max < 12 || v.min > 24) keys.push(`${v.min}-${v.max}v`);
  return keys;
}

const VOLTAGE_LABELS: Record<string, string> = { "12v": "12V", "24v": "24V", "12-24v": "12–24V multi-volt" };

type Extractor = { label: string; values: (c: ProductCard) => string[]; valueLabel: (v: string) => string };

/** Facet definitions in display order. Keys are also the URL query param names. */
export const FACETS: Record<string, Extractor> = {
  application: {
    label: "Application",
    values: (c) => c.applications,
    valueLabel: (v) => APPLICATION_LABELS[v] ?? v,
  },
  functions: {
    label: "Functions",
    values: (c) => c.specs.functions ?? [],
    valueLabel: (v) => FUNCTION_LABELS[v] ?? v,
  },
  mount: {
    label: "Mount",
    values: (c) => c.specs.mount ?? [],
    valueLabel: (v) => MOUNT_LABELS[v] ?? v,
  },
  connector: {
    label: "Plug type",
    values: (c) => (c.specs.connector ? [c.specs.connector] : []),
    valueLabel: (v) => CONNECTOR_LABELS[v] ?? v,
  },
  voltage: {
    label: "Voltage",
    values: voltageKeys,
    valueLabel: (v) => VOLTAGE_LABELS[v] ?? v.toUpperCase(),
  },
  ip: {
    label: "IP rating",
    values: (c) => (c.specs.ipRating ? [c.specs.ipRating.toLowerCase()] : []),
    valueLabel: (v) => v.toUpperCase(),
  },
  brand: {
    label: "Brand",
    values: (c) => [slugify(c.brand.name)],
    valueLabel: (v) => v,
  },
  price: {
    label: "Price",
    values: (c) => PRICE_BANDS.filter(([, , lo, hi]) => c.price >= lo && c.price < hi).map(([k]) => k),
    valueLabel: (v) => PRICE_BANDS.find(([k]) => k === v)?.[1] ?? v,
  },
  stock: {
    label: "Availability",
    values: (c) => (c.stock === "in_stock" || c.stock === "low" ? ["in-stock"] : []),
    valueLabel: () => "In stock",
  },
};

export const FACET_KEYS = Object.keys(FACETS);

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function matches(card: ProductCard, filters: Record<string, string[]>, skipKey?: string): boolean {
  for (const [key, wanted] of Object.entries(filters)) {
    if (key === skipKey || !wanted.length) continue;
    const def = FACETS[key];
    if (!def) continue;
    const have = def.values(card);
    if (!wanted.some((w) => have.includes(w))) return false;
  }
  return true;
}

const SORTS: Record<SortKey, (a: ProductCard & { _rank: number; _new: string }, b: ProductCard & { _rank: number; _new: string }) => number> = {
  best: (a, b) => b._rank - a._rank,
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  newest: (a, b) => b._new.localeCompare(a._new),
  rating: (a, b) => b.rating.average - a.rating.average || b.rating.count - a.rating.count,
};

export const SORT_LABELS: Record<SortKey, string> = {
  best: "Best selling",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  newest: "Newest",
  rating: "Top rated",
};

/**
 * Filter, facet (with counts that ignore the facet's own selection, so
 * options don't vanish when picked), sort and paginate.
 */
export function listCards(
  cards: (ProductCard & { _rank: number; _new: string })[],
  opts: ListOpts,
): Page<ProductCard> {
  const filters = opts.filters ?? {};
  const pageSize = opts.pageSize ?? DEFAULT_PAGE_SIZE;
  const page = Math.max(1, opts.page ?? 1);

  const facets: Facet[] = [];
  for (const [key, def] of Object.entries(FACETS)) {
    const counts = new Map<string, number>();
    for (const c of cards) {
      if (!matches(c, filters, key)) continue;
      for (const v of new Set(def.values(c))) counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    const selected = new Set(filters[key] ?? []);
    const values = [...counts.entries()]
      .map(([value, count]) => ({ value, count, label: key === "brand" ? brandLabel(cards, value) : def.valueLabel(value) }))
      .filter((v) => v.count > 0 || selected.has(v.value))
      .sort((a, b) => (key === "price" ? priceOrder(a.value) - priceOrder(b.value) : b.count - a.count || a.label.localeCompare(b.label)));
    // A facet with a single option that every product shares isn't a useful filter.
    const total = cards.filter((c) => matches(c, filters, key)).length;
    if (values.length > 1 || (values.length === 1 && values[0].count < total) || selected.size) {
      facets.push({ key, label: def.label, values });
    }
  }

  const filtered = cards.filter((c) => matches(c, filters)).sort(SORTS[opts.sort ?? "best"]);
  const start = (page - 1) * pageSize;
  return {
    items: filtered.slice(start, start + pageSize).map(stripPrivate),
    total: filtered.length,
    page,
    pageSize,
    facets,
  };
}

function stripPrivate(c: ProductCard & { _rank: number; _new: string }): ProductCard {
  const { _rank: _r, _new: _n, ...card } = c;
  void _r;
  void _n;
  return card;
}

function brandLabel(cards: ProductCard[], slug: string): string {
  return cards.find((c) => slugify(c.brand.name) === slug)?.brand.name ?? slug;
}

function priceOrder(v: string): number {
  return PRICE_BANDS.findIndex(([k]) => k === v);
}

/** Parse Next.js searchParams into ListOpts. Unknown keys are ignored. */
export function parseListParams(sp: Record<string, string | string[] | undefined>): ListOpts {
  const filters: Record<string, string[]> = {};
  for (const key of FACET_KEYS) {
    const raw = sp[key];
    if (!raw) continue;
    const vals = (Array.isArray(raw) ? raw : [raw]).flatMap((r) => r.split(",")).filter(Boolean);
    if (vals.length) filters[key] = vals;
  }
  const sortRaw = typeof sp.sort === "string" ? sp.sort : undefined;
  const sort = sortRaw && sortRaw in SORTS ? (sortRaw as SortKey) : undefined;
  const pageNum = Number(typeof sp.page === "string" ? sp.page : 1);
  return { filters, sort, page: Number.isFinite(pageNum) && pageNum > 0 ? Math.floor(pageNum) : 1 };
}

/** Serialise ListOpts back to a query string (stable order, comma-joined values). */
export function toQuery(opts: ListOpts): string {
  const p = new URLSearchParams();
  for (const key of FACET_KEYS) {
    const vals = opts.filters?.[key];
    if (vals?.length) p.set(key, [...vals].sort().join(","));
  }
  if (opts.sort && opts.sort !== "best") p.set("sort", opts.sort);
  if (opts.page && opts.page > 1) p.set("page", String(opts.page));
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function hasFilters(opts: ListOpts): boolean {
  return Object.values(opts.filters ?? {}).some((v) => v.length > 0);
}
