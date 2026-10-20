// Polite, cached fetcher for www.ozled.com.au (robots.txt Crawl-delay: 1).
// Sequential, >= 1.1 s between network requests, every response cached in .cache/.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
export const ORIGIN = "https://www.ozled.com.au";
const CACHE = path.join(ROOT, ".cache");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
const FORBIDDEN = [/^\/_mycart/, /^\/_myacct/, /^\/do\//, /^\/ajax\//];
const DELAY_MS = 1100;
let last = 0;
export const stats = { network: 0, cached: 0 };
const OFFLINE = process.env.FIXTURES_OFFLINE === "1";

function keyFor(url, kind) {
  const u = new URL(url, ORIGIN);
  const slug = (u.host + u.pathname + u.search).replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120);
  const h = crypto.createHash("sha1").update(u.href).digest("hex").slice(0, 10);
  return path.join(CACHE, kind, `${slug}__${h}`);
}

async function wait() {
  const d = last + DELAY_MS - Date.now();
  if (d > 0) await new Promise((r) => setTimeout(r, d));
  last = Date.now();
}

function guard(url) {
  const u = new URL(url, ORIGIN);
  if (u.host.endsWith("ozled.com.au") && FORBIDDEN.some((re) => re.test(u.pathname)))
    throw new Error(`Refusing to fetch disallowed path ${u.pathname}`);
  return u;
}

/** GET an HTML/text page, cached. Returns { status, url, body } */
export async function getText(url) {
  const u = guard(url);
  const f = keyFor(u.href, "html");
  if (fs.existsSync(f + ".json")) {
    stats.cached++;
    return JSON.parse(fs.readFileSync(f + ".json", "utf8"));
  }
  if (OFFLINE) throw new Error(`Not cached (offline): ${u.href}`);
  await wait();
  stats.network++;
  const res = await fetch(u.href, {
    headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,*/*;q=0.8", "Accept-Language": "en-AU,en;q=0.9" },
    redirect: "follow",
  });
  const body = await res.text();
  const out = { status: res.status, url: res.url, body };
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f + ".json", JSON.stringify(out));
  return out;
}

/** GET binary (images), cached. Returns Buffer or null. */
export async function getBinary(url) {
  const u = guard(url);
  const f = keyFor(u.href, "bin");
  if (fs.existsSync(f + ".bin")) {
    stats.cached++;
    return fs.readFileSync(f + ".bin");
  }
  if (fs.existsSync(f + ".404")) return null;
  if (OFFLINE) throw new Error(`Not cached (offline): ${u.href}`);
  await wait();
  stats.network++;
  const res = await fetch(u.href, { headers: { "User-Agent": UA, Referer: ORIGIN + "/" } });
  fs.mkdirSync(path.dirname(f), { recursive: true });
  if (!res.ok) {
    fs.writeFileSync(f + ".404", String(res.status));
    return null;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(f + ".bin", buf);
  return buf;
}

/** HEAD for size, cached. Returns { status, length } */
export async function head(url) {
  const u = guard(url);
  const f = keyFor(u.href, "head");
  if (fs.existsSync(f + ".json")) return JSON.parse(fs.readFileSync(f + ".json", "utf8"));
  if (OFFLINE) return null;
  await wait();
  stats.network++;
  const res = await fetch(u.href, { method: "HEAD", headers: { "User-Agent": UA }, redirect: "follow" });
  const out = { status: res.status, length: Number(res.headers.get("content-length") || 0), type: res.headers.get("content-type") };
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f + ".json", JSON.stringify(out));
  return out;
}
