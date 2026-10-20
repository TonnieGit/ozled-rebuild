// Step 5: build src/data/fixtures/categories.json and products.json from the cached scrape
// plus the hand-reviewed data in data/categories.mjs and data/products-curated.mjs.
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/fetch.mjs";
import { sanitize, text, innerAt, escapeHtml } from "./lib/html.mjs";
import { TREE, SITE } from "./data/categories.mjs";
import { CURATED } from "./data/products-curated.mjs";
import { PRODUCT_PATHS } from "./data/product-list.mjs";
import { CATEGORY_BODIES } from "./data/category-bodies.mjs";
import { DESCRIPTIONS } from "./data/descriptions.mjs";

const TODAY = "2026-10-20";
const OUT = path.join(ROOT, "src/data/fixtures");
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, ".cache/parsed", f), "utf8"));
const catPages = read("category-pages.json");
const raw = read("products-raw.json");
const imgs = read("product-images.json");
const heads = read("doc-heads.json");
const problems = [];
const warn = (m) => problems.push(m);
const words = (s) => s.trim().split(/\s+/).length;

// ───────────────────────── Categories ─────────────────────────
function seoDescription(name, blurb, parentName) {
  const tails = [
    ` ${SITE}`,
    " Shop online at OzLED or pick up from our Brendale, QLD showroom.",
    " Shop online at OzLED with delivery Australia-wide.",
    " Shop online at OzLED.",
    " At OzLED, Brendale QLD.",
  ];
  const middles = ["", parentName ? ` Part of the OzLED ${parentName} range.` : "", " Call (07) 3205 4355 for advice."];
  const candidates = [];
  for (const m of middles) for (const t of tails) candidates.push(`${blurb}${m}${t}`);
  for (const t of tails) candidates.push(`${blurb}${middles[1]}${middles[2]}${t}`);
  return candidates.find((c) => c.length >= 140 && c.length <= 160);
}

const categories = [];
function walk(nodes, parentId, parentName, inBase6 = false) {
  nodes.forEach(([id, name, p, blurb, opts = {}], i) => {
    const children = opts.children || [];
    let body = CATEGORY_BODIES[id];
    if (body === undefined && children.length) {
      body = `<p>Browse ${escapeHtml(name)} by type:</p>\n<ul>\n${children.map(([, cn, cp]) => `<li><a href="${escapeHtml(cp)}">${escapeHtml(cn)}</a></li>`).join("\n")}\n</ul>`;
    }
    const base = inBase6 && !/BASE6/i.test(name) ? `BASE6 ${name}` : name;
    const seoTitle = opts.seoTitle || (`${base} | OzLED`.length <= 60 ? `${base} | OzLED` : `${name} | OzLED`);
    const desc = opts.seoDescription || seoDescription(name, blurb, parentName);
    if (!desc) warn(`category ${id}: no seo description candidate fits 140–160 (blurb ${blurb.length})`);
    if (seoTitle.length > 60) warn(`category ${id}: seo title too long (${seoTitle.length})`);
    categories.push({
      id,
      parentId,
      name,
      ...(opts.navLabel ? { navLabel: opts.navLabel } : {}),
      path: p,
      intro: opts.intro || blurb,
      bodyHtml: body || "",
      faqs: opts.faqs || [],
      onMenu: true,
      sortOrder: i + 1,
      seo: { title: seoTitle, description: desc || blurb },
    });
    walk(children, id, opts.navLabel || name, inBase6 || id === "base6");
  });
}
walk(TREE, null);
const catByPath = new Map(categories.map((c) => [c.path, c]));
const catIds = new Set(categories.map((c) => c.id));

// ───────────────────────── Products ─────────────────────────
// Listing positions → which categories list the product, and a best-seller rank.
const listedIn = {}; // key (path or sku) → Set(catId)
const bestPos = {}; // key → best DOM position (0 = first card)
for (const [p, page] of Object.entries(catPages)) {
  const cat = catByPath.get(p);
  page.cards.forEach((c, pos) => {
    for (const key of [c.path, c.sku]) {
      if (!key) continue;
      if (cat) (listedIn[key] ||= new Set()).add(cat.id);
      bestPos[key] = Math.min(bestPos[key] ?? Infinity, pos);
    }
  });
}

const GLOBAL_DROP = [
  /^IMPORTANT NOTE: This item is stocked/i,
  /^Shipping Notice:?/i,
  /^Due to a national shortage/i,
  /^Technical Drawings?:?$/i,
  /^Download (Data|Tech) Sheet$/i,
  /^(Data Sheet|Click Here|DATA SHEET DOWNLOAD CLICK HERE)$/i,
  /^Simple 2 Step Process/i,
  /^Step [12]$/i,
  /This product description is still being worked on/i,
  /^[.\s]*$/,
  /CLICK HERE IF YOU ARE LOOKING FOR/i,
  /^Features \/ Specifications$/i,
  /^\*\*\*Don't be fooled/i,
];
const LIST_HEADING = /feature|specification|technical information|in the box|kit includes|key product features/i;
const SPEC_LINE = /\b(IP\s?\d\d|\d+\s*-\s*\d+\s*V|volt|warrant|\d+\s*mm\s*x|ADR|ECE|approved|rated)\b/i;

const trimLoose = (s) =>
  s.replace(/^(\s|<br>|<\/(em|strong|a)>)+/, "").replace(/(\s|<br>|<(em|strong)>)+$/, "");

function blocks(html) {
  const out = [];
  const re = /<(p|h2|h3|h4|ul|ol|table)\b[^>]*>/gi;
  let pos = 0;
  let m;
  while ((m = re.exec(html))) {
    if (m.index < pos) continue;
    const stray = trimLoose(html.slice(pos, m.index));
    if (text(stray)) out.push({ tag: "p", html: `<p>${stray}</p>` });
    const inner = innerAt(html, m.index);
    const tag = m[1].toLowerCase();
    const full = `<${tag}>${inner}</${tag}>`;
    out.push({ tag, html: full });
    pos = m.index + m[0].length + inner.length + `</${tag}>`.length;
    re.lastIndex = pos;
  }
  const tail = trimLoose(html.slice(pos));
  if (text(tail)) out.push({ tag: "p", html: `<p>${tail}</p>` });
  return out;
}

function cleanDescription(rawHtml, cur) {
  let html = sanitize(rawHtml);
  for (const [a, z] of cur.replace || []) html = html.split(a).join(z);
  const drops = [...GLOBAL_DROP, ...(cur.drop || [])];
  const kept = [];
  let listCount = 0;
  let prevHeading = null;
  const seen = new Set();
  for (const b of blocks(html)) {
    const t = text(b.html).replace(/\s+/g, " ").trim();
    const isHeading = /^h[234]$/.test(b.tag) || (b.tag === "p" && /^<p>\s*<strong>[^<]*<\/strong>\s*<\/p>$/.test(b.html) && t.length < 70);
    if (b.tag === "ul" || b.tag === "ol") {
      listCount++;
      const items = [...b.html.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((x) => text(x[1]));
      const specish = items.filter((x) => SPEC_LINE.test(x)).length >= Math.ceil(items.length / 2);
      const drop =
        cur.dropAllLists ||
        (cur.dropFirstList && listCount === 1) ||
        (cur.dropListAfter && prevHeading && cur.dropListAfter.test(prevHeading)) ||
        (prevHeading && LIST_HEADING.test(prevHeading)) ||
        specish;
      if (drop) {
        // also drop a dangling heading that introduced this list
        if (kept.length && kept[kept.length - 1].heading) kept.pop();
        prevHeading = null;
        continue;
      }
    }
    if (b.tag === "table" && (cur.dropTables || /Step 1/.test(t))) continue;
    if (drops.some((re) => re.test(t))) {
      if (isHeading) prevHeading = t;
      continue;
    }
    if (/^<p>(\s*<a href="[^"]+\.(pdf|PDF)"[^>]*>[^<]*<\/a>\s*)+<\/p>$/.test(b.html)) continue;
    if (cur.dropDuplicateParagraphs && seen.has(t)) continue;
    seen.add(t);
    kept.push({ ...b, heading: isHeading });
    prevHeading = isHeading ? t : null;
  }
  while (kept.length && kept[kept.length - 1].heading) kept.pop();
  return kept.map((b) => b.html).join("\n");
}

function stockOf(texts) {
  const t = texts.join(" ");
  if (/Out of Stock/i.test(t)) return { stock: "out", pickupAvailable: false };
  if (/Pre-?order|Backorder/i.test(t)) return { stock: "backorder", pickupAvailable: false };
  if (/Low Stock|Only \d+ left/i.test(t)) return { stock: "low", pickupAvailable: /Pickup/i.test(t) };
  if (/Instock - Online & Pickup Instore/i.test(t)) return { stock: "in_stock", pickupAvailable: true };
  if (/Instock at Supplier Warehouse/i.test(t)) return { stock: "in_stock", pickupAvailable: false };
  warn(`unknown stock text: ${t}`);
  return { stock: "in_stock", pickupAvailable: false };
}

const VIEW_ALT = { main: "product view", lit: "lit up", detail: "detail view", installed: "installed on a vehicle", packaging: "retail packaging", diagram: "dimensions diagram" };
const fixUrl = (u) => u.trim().replace(/^http:\/\/(www\.)?ozled\.com\.au/i, "https://www.ozled.com.au");

const products = [];
for (const p of PRODUCT_PATHS) {
  const r = raw[p];
  const cur = CURATED[p];
  if (!r || r.status !== 200) { warn(`missing raw page ${p}`); continue; }
  if (!cur) { warn(`no curated data for ${p}`); continue; }
  if (new URL(r.finalUrl).pathname !== encodeURI(p).replace(/%25/g, "%") && decodeURI(new URL(r.finalUrl).pathname) !== p) warn(`${p} redirected to ${r.finalUrl}`);
  const name = cur.name || r.name;

  // Images
  const counts = {};
  const images = (imgs[p] || []).map((im) => {
    counts[im.view] = (counts[im.view] || 0) + 1;
    const n = counts[im.view];
    const label = VIEW_ALT[im.view] + (n > 1 ? ` ${n}` : "");
    return { src: im.src, alt: `${name} – ${label}`, width: im.width, height: im.height, view: im.view };
  });
  if (!images.length) warn(`${p}: no images`);

  // Documents
  const docs = [];
  const seenDoc = new Set();
  const candidates = [...r.docLinks.map((d) => ({ url: d.url, label: d.label })), ...r.descImages.map((i) => ({ url: i.src, label: "" }))];
  for (const d of candidates) {
    const key = d.url.trim();
    const override = cur.docs?.[key];
    const isImage = /\.(png|jpe?g|gif|webp)(\?|$)/i.test(key);
    if (isImage && !override) continue; // only explicitly reviewed images become documents
    if (override === false) continue;
    if (seenDoc.has(key)) continue;
    seenDoc.add(key);
    const h = heads[key];
    if (!h || h.status !== 200) { warn(`${r.sku}: document dropped (HTTP ${h?.status ?? "?"}) ${key}`); continue; }
    const fileType = /\.pdf(\?|$)/i.test(key) ? "pdf" : isImage ? "image" : "web";
    docs.push({
      kind: override?.kind || "datasheet",
      title: override?.title || `${name} ${d.label ? d.label.toLowerCase() : "data sheet"}`,
      url: fixUrl(key),
      fileType,
      ...(h.length ? { sizeKb: Math.round(h.length / 1024) } : {}),
    });
    if (!override) warn(`${r.sku}: document without reviewed title ${key}`);
  }

  // Categories
  const ids = new Set([cur.primaryCategoryId, ...(cur.extraCategoryIds || [])]);
  for (const key of [p, r.sku]) for (const id of listedIn[key] || []) ids.add(id);
  for (const b of r.breadcrumb) { const c = catByPath.get(b.path); if (c) ids.add(c.id); }
  for (const id of ids) if (!catIds.has(id)) warn(`${r.sku}: unknown category ${id}`);

  const pos = Math.min(bestPos[p] ?? Infinity, bestPos[r.sku] ?? Infinity);
  const salesRank = Number.isFinite(pos) ? Math.max(10, 1000 - pos * 40) : 50;

  const { stock, pickupAvailable } = stockOf(r.stockTexts);
  const descriptionHtml = DESCRIPTIONS[p] ?? (cur.descriptionHtml !== undefined ? cur.descriptionHtml : cleanDescription(r.descriptionRaw, cur));

  const n = words(cur.summary);
  if (n < 40 || n > 60) warn(`${r.sku}: summary is ${n} words`);
  if (cur.seo.title.length > 60) warn(`${r.sku}: seo title ${cur.seo.title.length} chars`);
  if (cur.seo.description.length < 140 || cur.seo.description.length > 160) warn(`${r.sku}: seo description ${cur.seo.description.length} chars`);
  if (cur.features.length < 3 || cur.features.length > 6) warn(`${r.sku}: ${cur.features.length} features`);

  products.push({
    sku: r.sku,
    path: p,
    name,
    brand: cur.brand,
    price: r.price,
    ...(r.rrp && r.rrp > r.price ? { rrp: r.rrp } : {}),
    images,
    stock,
    pickupAvailable,
    specs: cur.specs,
    applications: cur.applications,
    compatibleWith: cur.compatibleWith,
    restricted: !!cur.restricted,
    summary: cur.summary,
    features: cur.features,
    descriptionHtml,
    documents: docs,
    videos: Object.entries(cur.videos || {}).map(([youtubeId, title]) => ({ youtubeId, title })),
    faqs: cur.faqs,
    reviews: { summary: { count: 0, average: 0, distribution: [0, 0, 0, 0, 0] }, items: [] },
    primaryCategoryId: cur.primaryCategoryId,
    categoryIds: [cur.primaryCategoryId, ...[...ids].filter((x) => x !== cur.primaryCategoryId)],
    ...(cur.gtin ? { gtin: cur.gtin } : {}),
    ...(cur.mpn ? { mpn: cur.mpn } : {}),
    seo: cur.seo,
    salesRank,
    createdAt: TODAY,
    updatedAt: TODAY,
  });
}

// Referential checks that are cheap to do here (the Vitest suite repeats them)
const skus = new Set(products.map((x) => x.sku));
for (const x of products) for (const s of x.compatibleWith) if (!skus.has(s)) warn(`${x.sku}: compatibleWith unknown SKU ${s}`);
if (skus.size !== products.length) warn("duplicate SKUs");

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "categories.json"), JSON.stringify(categories, null, 2) + "\n");
fs.writeFileSync(path.join(OUT, "products.json"), JSON.stringify(products, null, 2) + "\n");
console.log(`categories: ${categories.length}, products: ${products.length}`);
if (problems.length) console.log("NOTES:\n- " + problems.join("\n- "));
