import type { NextRequest } from "next/server";
import { searchAll } from "@/lib/search-index";

/** Instant-search endpoint for the header panel (SPEC §7.8). */
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").slice(0, 80).trim();
  if (q.length < 2) return Response.json({ products: [], categories: [], guides: [] });
  const r = await searchAll(q);
  return Response.json(
    { products: r.products.slice(0, 6), categories: r.categories.slice(0, 4), guides: r.guides.slice(0, 3), total: r.products.length },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } },
  );
}
