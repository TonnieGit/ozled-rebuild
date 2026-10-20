import type { NextRequest } from "next/server";
import { data } from "@/data";

/**
 * Fresh stock for a product page (SPEC §4.2): pages are static for an hour,
 * this route is cached 60 s at the edge so "In stock" can't go stale for long.
 */
export async function GET(request: NextRequest) {
  const sku = request.nextUrl.searchParams.get("sku");
  if (!sku) return Response.json({ error: "sku required" }, { status: 400 });
  const product = await data.getProductBySku(sku);
  if (!product) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(
    { sku, stock: product.stock, pickupAvailable: product.pickupAvailable, price: product.price },
    { headers: { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=30" } },
  );
}
