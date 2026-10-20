import type { NextRequest } from "next/server";
import { data } from "@/data";
import { parseListParams } from "@/data/facets";
import { Application } from "@/data/schema";

/** Next page of a listing for "Load more". key = "category:<id>" | "application:<app>". */
export async function GET(request: NextRequest) {
  const sp = Object.fromEntries(request.nextUrl.searchParams.entries());
  const [kind, id] = (sp.key ?? "").split(":");
  const opts = parseListParams(sp);
  let page;
  if (kind === "category" && id) page = await data.getProductsByCategory(id, opts);
  else if (kind === "application" && Application.safeParse(id).success) page = await data.getProductsByApplication(Application.parse(id), opts);
  else return Response.json({ error: "bad key" }, { status: 400 });
  return Response.json({ items: page.items, total: page.total, page: page.page }, { headers: { "Cache-Control": "public, s-maxage=300" } });
}
