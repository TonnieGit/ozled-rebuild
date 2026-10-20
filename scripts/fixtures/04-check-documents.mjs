// Step 4: HEAD every document link found on product pages (cached) for size and status.
// Output: .cache/parsed/doc-heads.json
import fs from "node:fs";
import path from "node:path";
import { head, ROOT, stats } from "./lib/fetch.mjs";
import { PRODUCT_PATHS } from "./data/product-list.mjs";

const raw = JSON.parse(fs.readFileSync(path.join(ROOT, ".cache/parsed/products-raw.json"), "utf8"));
const urls = new Set();
for (const p of PRODUCT_PATHS) {
  const r = raw[p];
  for (const d of r.docLinks || []) urls.add(d.url.trim());
  for (const i of r.descImages || []) if (/tech|drawing|diagram|fitting|resistor|install/i.test(i.src)) urls.add(i.src.trim());
}
const out = {};
for (const u of urls) {
  try {
    out[u] = await head(u);
  } catch (e) {
    out[u] = { status: 0, error: String(e.message || e) };
  }
  console.log(out[u]?.status, Math.round((out[u]?.length || 0) / 1024) + "KB", u);
}
fs.writeFileSync(path.join(ROOT, ".cache/parsed/doc-heads.json"), JSON.stringify(out, null, 2));
console.error(stats);
