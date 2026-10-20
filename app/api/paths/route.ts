import { cacheLife, cacheTag } from "next/cache";
import { data } from "@/data";
import { STATIC_PATHS } from "@/data/path-index";

async function paths() {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalogue");
  return [...STATIC_PATHS, ...(await data.listPaths()).map((p) => p.path)];
}

/** Path index for proxy.ts in Neto mode (fixtures mode reads the JSON directly). */
export async function GET() {
  return Response.json(await paths());
}
