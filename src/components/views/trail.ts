import { data } from "@/data";
import type { Category } from "@/data/types";

/** Root → … → category, from a single primary category (SPEC §8.2). */
export async function categoryTrail(categoryId: string | null): Promise<Category[]> {
  const trail: Category[] = [];
  let id = categoryId;
  for (let guard = 0; id && guard < 8; guard++) {
    const c = await data.getCategoryById(id);
    if (!c) break;
    trail.unshift(c);
    id = c.parentId;
  }
  return trail;
}
