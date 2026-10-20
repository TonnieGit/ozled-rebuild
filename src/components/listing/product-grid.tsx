"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { ProductCard } from "@/components/product/product-card";
import { toQuery } from "@/data/facets";
import type { ListOpts, ProductCard as Card } from "@/data/types";

/**
 * Grid with "Load more" (SPEC §7.4). The server renders page N; crawlers follow the
 * real ?page= links in <Pagination>; shoppers append pages in place.
 */
export function ProductGrid({
  initial,
  opts,
  total,
  pageSize,
  listingKey,
}: {
  initial: Card[];
  opts: ListOpts;
  total: number;
  pageSize: number;
  /** "category:<id>" | "application:<app>" for the listing API. */
  listingKey: string;
}) {
  const pathname = usePathname();
  const startPage = opts.page ?? 1;
  const [cards, setCards] = useState(initial);
  const [page, setPage] = useState(startPage);
  const [loading, setLoading] = useState(false);
  const shownTo = (startPage - 1) * pageSize + cards.length;
  const more = shownTo < total;

  async function loadMore() {
    setLoading(true);
    try {
      const next = page + 1;
      const q = toQuery({ ...opts, page: next });
      const res = await fetch(`/api/listing?key=${encodeURIComponent(listingKey)}&${q.slice(1)}`);
      const json = (await res.json()) as { items: Card[] };
      setCards((c) => [...c, ...json.items]);
      setPage(next);
      window.history.replaceState(null, "", `${pathname}${q}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        {cards.map((c, i) => (
          <li key={c.sku}>
            <ProductCard card={c} priority={i < 4 && startPage === 1} />
          </li>
        ))}
      </ul>
      {cards.length === 0 && <p className="py-16 text-center text-fg-muted">No products match those filters.</p>}
      {more && (
        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-sm text-fg-muted">
            Showing {shownTo} of {total}
          </p>
          <button type="button" onClick={loadMore} disabled={loading} className="h-12 min-w-56 rounded-md border-2 border-fg px-6 font-semibold hover:bg-fg hover:text-bg disabled:opacity-50">
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </>
  );
}
