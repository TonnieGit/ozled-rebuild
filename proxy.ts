import { NextResponse, type NextRequest } from "next/server";
import redirects from "./src/data/fixtures/redirects.json";
import { fixturePaths } from "./src/data/path-index";

/**
 * URL preservation (SPEC §8.1, docs/decisions.md #7).
 * 1. Legacy redirects are served before any app code (one hop, 301).
 * 2. The live site mixes "/category/" and "/product" forms, so trailing slashes are
 *    significant. Next normalises them away, so "/x/" is rewritten to the internal
 *    "/x/__ts" and the catch-all route rebuilds the exact path from that marker.
 * When the Cloudflare edge router (edge/worker.ts) is in front, it serves the same
 * redirect map first; this stays as a fallback for direct Vercel traffic.
 */
const TRAILING_SLASH_MARKER = "__ts"; // keep in sync with src/lib/paths.ts

/** Facet query params (src/data/facets.ts FACET_KEYS): filtered listings are noindex,follow (SPEC §7.4). */
const FACET_PARAMS = ["application", "functions", "mount", "connector", "voltage", "ip", "brand", "price", "stock", "sort"];

const redirectMap = new Map((redirects as { from: string; to: string; status: number }[]).map((r) => [r.from, r]));

/**
 * Known paths, so unknown URLs get a real 404 and the other trailing-slash form a
 * real one-hop 301 (inside a streamed page the 200 is already sent).
 * Fixtures: from JSON. Neto: from /api/paths, cached in memory for 5 minutes.
 */
let known: { set: Set<string>; at: number } | null = null;
async function knownPaths(origin: string): Promise<Set<string> | null> {
  if (process.env.DATA_SOURCE !== "neto") return (known ??= { set: fixturePaths(), at: 0 }).set;
  if (known && Date.now() - known.at < 5 * 60_000) return known.set;
  try {
    const res = await fetch(`${origin}/api/paths`);
    known = { set: new Set((await res.json()) as string[]), at: Date.now() };
    return known.set;
  } catch {
    return known?.set ?? null; // fail open: let the page decide
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.includes(`/${TRAILING_SLASH_MARKER}`)) {
    return new NextResponse(null, { status: 404 });
  }

  const hit = redirectMap.get(pathname);
  if (hit) {
    return NextResponse.redirect(new URL(hit.to + search, request.url), hit.status);
  }

  const paths = await knownPaths(request.nextUrl.origin);
  if (paths && !paths.has(pathname)) {
    const other = pathname.endsWith("/") ? pathname.slice(0, -1) : `${pathname}/`;
    if (pathname !== "/" && paths.has(other)) return NextResponse.redirect(new URL(other + search, request.url), 301);
    const url = request.nextUrl.clone();
    url.pathname = "/_missing";
    url.search = "";
    return NextResponse.rewrite(url);
  }

  const filtered = FACET_PARAMS.some((k) => request.nextUrl.searchParams.has(k));
  let res: NextResponse;
  if (pathname.length > 1 && pathname.endsWith("/")) {
    const url = request.nextUrl.clone();
    url.pathname = `${pathname}${TRAILING_SLASH_MARKER}`;
    res = NextResponse.rewrite(url);
  } else {
    res = NextResponse.next();
  }
  if (filtered) res.headers.set("X-Robots-Tag", "noindex, follow");
  return res;
}

export const config = {
  matcher: [
    // Everything except Next internals, API routes and static files (anything with an extension).
    "/((?!api/|_next/|_missing|images/|brand/|.*\\.[a-zA-Z0-9]{2,5}$).*)",
  ],
};
