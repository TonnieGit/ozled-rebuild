// Step 2: fetch every product page (cached) and parse raw fields.
// Output: .cache/parsed/products-raw.json
import fs from "node:fs";
import path from "node:path";
import { getText, ROOT, stats } from "./lib/fetch.mjs";
import { parseProductPage } from "./lib/product.mjs";
import { PRODUCT_PATHS } from "./data/product-list.mjs";

const out = {};
for (const p of PRODUCT_PATHS) {
  const r = await getText(p);
  if (r.status !== 200) { console.log("!!", r.status, p); out[p] = { status: r.status, finalUrl: r.url }; continue; }
  const parsed = parseProductPage(r.body, r.url);
  out[p] = { status: r.status, finalUrl: r.url, ...parsed };
  console.log(r.status, (parsed.sku || "?").padEnd(22), String(parsed.price).padStart(8), (parsed.stockTexts[0] || "").slice(0, 30).padEnd(30), parsed.images.length, "img", parsed.docLinks.length, "doc", parsed.youtube.length, "yt", parsed.crossSell.length, "xs", p);
}
fs.mkdirSync(path.join(ROOT, ".cache/parsed"), { recursive: true });
fs.writeFileSync(path.join(ROOT, ".cache/parsed/products-raw.json"), JSON.stringify(out, null, 2));
console.error(stats);
