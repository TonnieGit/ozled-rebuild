import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SearchBox } from "@/components/layout/search-box";
import { ProductCard } from "@/components/product/product-card";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { data } from "@/data";
import { searchAll } from "@/lib/search-index";

// Search pages are noindex (SPEC §7.8).
export const metadata: Metadata = { title: { absolute: "Search | OzLED" }, robots: { index: false, follow: true } };

export default function SearchPage(props: PageProps<"/search">) {
  return (
    <div className="container-x pt-6 pb-8">
      <h1 className="display text-d4">Search</h1>
      <div className="mt-4 max-w-2xl">
        <SearchBox variant="page" />
      </div>
      <Suspense fallback={<PageSkeleton />}>
        <Results {...props} />
      </Suspense>
    </div>
  );
}

async function Results({ searchParams }: PageProps<"/search">) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 80) ?? "";
  if (!q) return <Suggestions />;
  const r = await searchAll(q);
  const count = r.products.length;

  return (
    <div className="mt-8">
      <p className="text-fg-muted" aria-live="polite">
        {count ? (
          <>
            {count} {count === 1 ? "product" : "products"} for <strong className="text-fg">“{q}”</strong>
          </>
        ) : (
          <>
            No products found for <strong className="text-fg">“{q}”</strong>.
          </>
        )}
      </p>
      {r.categories.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {r.categories.map((c) => (
            <li key={c.path}>
              <Link href={c.path} className="flex h-10 items-center rounded-full border border-border-strong px-4 text-sm font-medium hover:border-fg">
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {count > 0 ? (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {r.products.map((c, i) => (
            <li key={c.sku}>
              <ProductCard card={c} priority={i < 4} />
            </li>
          ))}
        </ul>
      ) : (
        <Suggestions />
      )}
    </div>
  );
}

/** Zero-result page suggests hubs and top categories (SPEC §7.8). */
async function Suggestions() {
  const [hubs, tree] = await Promise.all([data.getApplicationHubs(), data.getCategoryTree()]);
  const top = tree.filter((c) => c.parentId === null && c.onMenu);
  return (
    <div className="mt-10 grid gap-10 md:grid-cols-2">
      <section aria-labelledby="sug-jobs">
        <h2 id="sug-jobs" className="display text-d2">
          Shop by job
        </h2>
        <ul className="mt-3 space-y-2">
          {hubs.map((h) => (
            <li key={h.path}>
              <Link href={h.path} className="font-semibold text-link hover:underline">
                {h.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="sug-cats">
        <h2 id="sug-cats" className="display text-d2">
          Popular categories
        </h2>
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {top.map((c) => (
            <li key={c.id}>
              <Link href={c.path} className="text-link hover:underline">
                {c.navLabel ?? c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
