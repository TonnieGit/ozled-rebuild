/**
 * Cloudflare Worker edge router for www.ozled.com.au (SPEC §3.1, docs/routing-spike.md).
 *
 *   1. Legacy redirects first (one hop, 301), before any app code (SPEC §8.1).
 *   2. Commerce paths → Neto origin (pass-through on the same hostname: requires
 *      Neto to accept O2O traffic, the blocking question in routing-spike.md §4).
 *   3. Everything else → the Next.js storefront on Vercel.
 *
 * Deploy: `wrangler deploy` from /edge once DNS is proxied. Not deployed yet.
 */
import redirects from "../src/data/fixtures/redirects.json";

export interface Env {
  /** e.g. https://ozled-storefront.vercel.app */
  STOREFRONT_ORIGIN: string;
}

const COMMERCE_PREFIXES = [
  "/_mycart",
  "/_myacct",
  "/myacct/",
  "/purchase",
  "/form/",
  "/do/",
  "/ajax/",
  "/assets/",
  "/_cpanel",
  "/cgi-bin/",
  // + payment callback paths found in the staging test checkout (routing-spike.md §5)
];

const redirectMap = new Map((redirects as { from: string; to: string; status: number }[]).map((r) => [r.from, r]));

export function routeFor(pathname: string): "commerce" | "storefront" {
  return COMMERCE_PREFIXES.some((p) => pathname.startsWith(p)) ? "commerce" : "storefront";
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    const hit = redirectMap.get(url.pathname);
    if (hit) return Response.redirect(new URL(hit.to + url.search, url).toString(), hit.status);

    if (routeFor(url.pathname) === "commerce") {
      // Same hostname: Cloudflare forwards to the zone's origin (Neto).
      return fetch(request);
    }

    const target = new URL(url.pathname + url.search, env.STOREFRONT_ORIGIN);
    const headers = new Headers(request.headers);
    headers.set("X-Forwarded-Host", url.host);
    headers.set("X-Forwarded-Proto", "https");
    return fetch(new Request(target, { method: request.method, headers, body: request.body, redirect: "manual" }));
  },
};

export default worker;
