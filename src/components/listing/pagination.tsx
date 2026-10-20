import Link from "next/link";
import { toQuery } from "@/data/facets";
import type { ListOpts } from "@/data/types";

/** Real paginated URLs under "Load more", for crawlers and no-JS (SPEC §7.4). */
export function Pagination({ path, opts, total, pageSize }: { path: string; opts: ListOpts; total: number; pageSize: number }) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  const current = opts.page ?? 1;
  return (
    <nav aria-label="Pages" className="mt-6 flex justify-center">
      <ul className="flex flex-wrap gap-1 text-sm">
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
          <li key={n}>
            <Link
              href={`${path}${toQuery({ ...opts, page: n })}`}
              aria-current={n === current ? "page" : undefined}
              className="grid size-9 place-items-center rounded-md text-fg-muted hover:bg-bg-muted aria-[current=page]:bg-fg aria-[current=page]:text-bg"
            >
              {n}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
