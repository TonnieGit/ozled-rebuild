import { NextResponse, type NextRequest } from "next/server";
import redirects from "./src/data/fixtures/redirects.json";

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

const redirectMap = new Map((redirects as { from: string; to: string; status: number }[]).map((r) => [r.from, r]));

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.includes(`/${TRAILING_SLASH_MARKER}`)) {
    return new NextResponse(null, { status: 404 });
  }

  const hit = redirectMap.get(pathname);
  if (hit) {
    return NextResponse.redirect(new URL(hit.to + search, request.url), hit.status);
  }

  if (pathname.length > 1 && pathname.endsWith("/")) {
    const url = request.nextUrl.clone();
    url.pathname = `${pathname}${TRAILING_SLASH_MARKER}`;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Everything except Next internals, API routes and static files (anything with an extension).
    "/((?!api/|_next/|images/|brand/|.*\\.[a-zA-Z0-9]{2,5}$).*)",
  ],
};
