// CLI: node scripts/fixtures/get.mjs /path [/path ...]  -> fetch (cached) and print cache status + length
import { getText, stats } from "./lib/fetch.mjs";
for (const p of process.argv.slice(2)) {
  const r = await getText(p);
  console.log(r.status, r.url, r.body.length);
}
console.error(stats);
