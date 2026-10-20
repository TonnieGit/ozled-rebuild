// Runs every fixture step in order. Network requests only happen for pages/images not yet in .cache/.
// Usage: node scripts/fixtures/build-all.mjs            (fetch anything missing, 1 req/s)
//        FIXTURES_OFFLINE=1 node scripts/fixtures/build-all.mjs   (cache only; fails if something is missing)
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const steps = [
  "01-scrape-categories.mjs",
  "02-scrape-products.mjs",
  "03-product-images.mjs",
  "04-check-documents.mjs",
  "05-build-catalog.mjs",
  "06-build-content.mjs",
];
for (const s of steps) {
  console.log(`\n▶ ${s}`);
  const r = spawnSync(process.execPath, [path.join(dir, s)], { stdio: "inherit", env: { ...process.env, MSYS_NO_PATHCONV: "1" } });
  if (r.status !== 0) {
    console.error(`✖ ${s} failed`);
    process.exit(r.status ?? 1);
  }
}
console.log("\n✔ fixtures rebuilt in src/data/fixtures/");
