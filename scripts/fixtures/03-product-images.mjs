// Step 3: download product images and convert to WebP (max 1200px, q80).
// Honours data/products-curated.mjs `views`: "skip" drops non-product images (logos, notices).
// Keeps at most 6 images. Output: public/images/products/{sku}/{n}.webp + .cache/parsed/product-images.json
import fs from "node:fs";
import path from "node:path";
import { ROOT, stats } from "./lib/fetch.mjs";
import { toWebp, safeName } from "./lib/images.mjs";
import { PRODUCT_PATHS } from "./data/product-list.mjs";
import { CURATED } from "./data/products-curated.mjs";

const raw = JSON.parse(fs.readFileSync(path.join(ROOT, ".cache/parsed/products-raw.json"), "utf8"));
const result = {};
for (const p of PRODUCT_PATHS) {
  const r = raw[p];
  if (!r || !r.sku) continue;
  const views = CURATED[p]?.views || [];
  const rel = `images/products/${safeName(r.sku)}`;
  fs.rmSync(path.join(ROOT, "public", rel), { recursive: true, force: true });
  const imgs = [];
  for (let i = 0; i < r.images.length && imgs.length < 6; i++) {
    const view = views[i] || (i === 0 ? "main" : "detail");
    if (view === "skip") continue;
    const res = await toWebp(r.images[i], `${rel}/${imgs.length + 1}.webp`);
    if (res) imgs.push({ ...res, view, from: r.images[i] });
  }
  result[p] = imgs;
  console.log(r.sku.padEnd(24), imgs.map((i) => `${i.view}:${i.width}x${i.height}`).join(" "));
}
fs.writeFileSync(path.join(ROOT, ".cache/parsed/product-images.json"), JSON.stringify(result, null, 2));
console.error(stats);
