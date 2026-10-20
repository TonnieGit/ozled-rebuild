// CLI: node scripts/fixtures/dump.mjs /path out.html  -> write cached body to a file (fetching if needed)
import fs from "node:fs";
import { getText } from "./lib/fetch.mjs";
const r = await getText(process.argv[2]);
fs.writeFileSync(process.argv[3], r.body);
console.log(r.status, r.url, r.body.length);
