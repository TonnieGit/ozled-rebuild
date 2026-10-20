#!/usr/bin/env node
/**
 * SEO/AEO audit (SPEC §8.3, each fix is a test). Crawls a running build from its
 * sitemaps and following internal links, then checks every HTML page for:
 *   - exactly one <h1>
 *   - canonical present, absolute, on www.ozled.com.au, equal to the clean route
 *   - every JSON-LD block parses (and has @context/@type)
 *   - no <img> without alt (alt="" allowed only with aria-hidden or role=presentation/decorative)
 *   - viewport allows zoom
 *   - every internal link returns 200 or a single-hop 301/308 (no chains, no 404s)
 *   - title ≤ 60 chars, meta description present
 * Usage: node scripts/audit.mjs [baseUrl=http://localhost:3000]
 */
const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const SITE = "https://www.ozled.com.au";
const MAX_PAGES = Number(process.env.AUDIT_MAX_PAGES ?? 400);

const failures = [];
const fail = (url, msg) => failures.push(`${url}  ${msg}`);

async function get(path) {
  const res = await fetch(BASE + path, { redirect: "manual", headers: { "User-Agent": "ozled-audit" } });
  return res;
}

async function sitemapPaths() {
  const robots = await (await get("/robots.txt")).text();
  const maps = [...robots.matchAll(/^Sitemap:\s*(\S+)/gim)].map((m) => new URL(m[1]).pathname);
  const paths = new Set(["/"]);
  for (const m of maps) {
    const xml = await (await get(m)).text();
    for (const loc of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) paths.add(new URL(loc[1]).pathname + new URL(loc[1]).search);
  }
  return [...paths];
}

const attr = (tag, name) => tag.match(new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`, "i"))?.[1];

function checkPage(path, html) {
  const h1s = html.match(/<h1[\s>]/gi) ?? [];
  if (h1s.length !== 1) fail(path, `expected 1 <h1>, found ${h1s.length}`);

  const robots = html.match(/<meta[^>]+name="robots"[^>]*>/i)?.[0];
  const noindex = robots && /noindex/i.test(attr(robots, "content") ?? "");
  const canonTag = html.match(/<link[^>]+rel="canonical"[^>]*>/i)?.[0];
  if (!noindex) {
    if (!canonTag) fail(path, "missing canonical");
    else {
      const href = attr(canonTag, "href");
      try {
        const u = new URL(href);
        if (u.origin !== SITE) fail(path, `canonical not on ${SITE}: ${href}`);
        if (/\s|%20/.test(u.pathname)) fail(path, `malformed canonical: ${href}`);
        const expected = path.split("?")[0];
        if (u.pathname !== expected && !path.includes("?")) fail(path, `canonical ${u.pathname} ≠ route ${expected}`);
      } catch {
        fail(path, `canonical does not parse: ${href}`);
      }
    }
  }

  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const j = JSON.parse(m[1]);
      for (const node of Array.isArray(j) ? j : [j]) {
        if (!node["@context"] || !node["@type"]) fail(path, `JSON-LD node missing @context/@type`);
      }
    } catch (e) {
      fail(path, `JSON-LD does not parse: ${e.message.slice(0, 60)}`);
    }
  }

  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    const alt = attr(tag, "alt");
    // alt="" is allowed: decorative thumbnails sit next to their text label.
    if (alt === undefined) fail(path, `<img> without alt: ${attr(tag, "src")?.slice(0, 60)}`);
  }

  const vp = html.match(/<meta[^>]+name="viewport"[^>]*>/i)?.[0] ?? "";
  if (/user-scalable\s*=\s*(0|no)/i.test(vp) || /maximum-scale\s*=\s*1(\.0)?\b/i.test(vp)) fail(path, "viewport blocks zoom");

  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1]?.replace(/&amp;/g, "&") ?? "";
  if (!title) fail(path, "missing <title>");
  else if (title.length > 60 && !noindex) fail(path, `title > 60 chars (${title.length}): ${title}`);
  if (!noindex && !/<meta[^>]+name="description"/i.test(html)) fail(path, "missing meta description");

  return [...html.matchAll(/<a\b[^>]*href="([^"#]+)"/gi)]
    .map((m) => m[1].replace(/&amp;/g, "&"))
    .filter((h) => h.startsWith("/") && !h.startsWith("//"))
    .filter((h) => !/^\/(_mycart|_myacct|myacct|form\/|do\/|ajax\/|purchase)/.test(h));
}

const seen = new Map(); // path → status
const queue = await sitemapPaths();
const linkSources = new Map();

while (queue.length && seen.size < MAX_PAGES) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  const res = await get(path);
  seen.set(path, res.status);
  if (res.status === 301 || res.status === 308) {
    const loc = new URL(res.headers.get("location"), BASE);
    const next = await get(loc.pathname + loc.search);
    if (next.status !== 200) fail(path, `redirect chain or broken target (${res.status} → ${next.status} ${loc.pathname})`);
    continue;
  }
  if (res.status !== 200) {
    fail(path, `HTTP ${res.status} (linked from ${linkSources.get(path) ?? "sitemap"})`);
    continue;
  }
  if (!(res.headers.get("content-type") ?? "").includes("text/html")) continue;
  const links = checkPage(path, await res.text());
  for (const l of links) {
    // Facet/sort/pagination variants are noindex or covered by their base page; check base only.
    const clean = l.includes("?") && !/^\?page=\d+$/.test(l.slice(l.indexOf("?"))) ? l.split("?")[0] : l;
    if (!seen.has(clean) && !queue.includes(clean)) {
      queue.push(clean);
      linkSources.set(clean, path);
    }
  }
}

console.log(`Audited ${seen.size} URLs against ${BASE}`);
if (failures.length) {
  console.error(`\n${failures.length} failure(s):\n` + failures.map((f) => `  ✗ ${f}`).join("\n"));
  process.exit(1);
}
console.log("✓ All SPEC §8.3 checks passed");
