import { data } from "@/data";
import type { Category } from "./types";

/** Categories that have at least one product (empty listings 404, so never link them). */
export async function nonEmpty(categories: Category[]): Promise<Category[]> {
  const counts = await Promise.all(categories.map((c) => data.getProductsByCategory(c.id, { pageSize: 1 }).then((p) => p.total)));
  return categories.filter((_, i) => counts[i] > 0);
}
