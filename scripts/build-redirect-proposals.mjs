#!/usr/bin/env node
/**
 * Phase 5 helper (SPEC §8.1): propose keyword slugs for slugless "/~12345" product URLs.
 *
 * Reads docs/research/sitemap-urls-*.txt, fetches each slugless page politely
 * (robots.txt Crawl-delay: 1 → one request per 1.1 s, cached in .cache/slugless/),
 * takes the product name from <h1>/<title>, and writes
 * docs/research/slugless-redirect-proposals.csv:  from,to,name,canonical_now
 *
 * These are PROPOSALS for review. With Neto API access, regenerate from
 * GetItem (SKU, Name, ItemURL) instead and set the new slugs in Neto itself.
 * Usage: node scripts/build-redirect-proposals.mjs [limit]
 */
import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = path.join(ROOT, ".cache", "slugless");
const LIMIT = Number(process.argv[2] ?? Infinity);
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const research = path.join(ROOT, "docs", "research");
const listFile = (await readdir(research)).filter((f) => f.startsWith("sitemap-urls-")).sort().pop();
const urls = (await readFile(path.join(research, listFile), "utf8")).split(/\r?\n/).filter(Boolean);
const slugless = urls.map((u) => new URL(u).pathname).filter((p) => /^\/~\d+$/.test(p));
const taken = new Set(urls.map((u) => new URL(u).pathname.replace(/\/$/, "").toLowerCase()));

await mkdir(CACHE, { recursive: true });

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

export function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/(\d)\.(\d)/g, "$1-$2")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .split("-")
    .slice(0, 12)
    .join("-");
}

const rows = [["from", "to", "name", "canonical_now"]];
let fetched = 0;
for (const p of slugless.slice(0, LIMIT)) {
  const cacheFile = path.join(CACHE, `${p.slice(2)}.html`);
  let html;
  if (existsSync(cacheFile)) html = await readFile(cacheFile, "utf8");
  else {
    await new Promise((r) => setTimeout(r, 1100));
    const res = await fetch(`https://www.ozled.com.au${p}`, { headers: { "User-Agent": UA } });
    if (!res.ok) {
      console.warn(`${p}: HTTP ${res.status}`);
      continue;
    }
    html = await res.text();
    await writeFile(cacheFile, html);
    fetched++;
  }
  // Not <h1>: the live theme's first H1 is a site-wide banner, not the product name.
  const og = html.match(/<meta property="og:title" content="([^"]+)"/i)?.[1];
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
  const name = decode(og || title || "").replace(/(\s+-\s+[A-Z0-9 &]+)+$/, "").replace(/\s*\|\s*OzLED\s*$/i, "");
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1] ?? "";
  if (!name) continue;
  let slug = slugify(name);
  let n = 2;
  while (taken.has(`/${slug}`)) slug = `${slugify(name)}-${n++}`;
  taken.add(`/${slug}`);
  rows.push([p, `/${slug}`, name, canonical]);
  if (fetched && fetched % 50 === 0) console.log(`…${fetched} fetched`);
}

const csv = rows.map((r) => r.map((c) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(",")).join("\n");
await writeFile(path.join(research, "slugless-redirect-proposals.csv"), csv + "\n");
console.log(`${rows.length - 1} proposals written (${fetched} pages fetched this run, ${slugless.length} slugless URLs total)`);
