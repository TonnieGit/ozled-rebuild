import Link from "next/link";
import { FilterSidebar, ListingToolbar } from "@/components/listing/filters";
import { Pagination } from "@/components/listing/pagination";
import { ProductGrid } from "@/components/listing/product-grid";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FaqList } from "@/components/ui/faq-list";
import { JsonLd } from "@/components/ui/json-ld";
import { data } from "@/data";
import { DEFAULT_PAGE_SIZE } from "@/data/facets";
import type { Category, ListOpts } from "@/data/types";
import { breadcrumbList, collectionPage, faqPage } from "@/seo/jsonld";
import { categoryTrail } from "./trail";

/**
 * Category template (SPEC §7.4): H1 + answer-first intro above the grid,
 * filters, grid, long-form copy and FAQs below.
 */
export async function CategoryView({ category, opts }: { category: Category; opts: ListOpts }) {
  const [trail, page, all] = await Promise.all([
    categoryTrail(category.id),
    data.getProductsByCategory(category.id, { ...opts, pageSize: DEFAULT_PAGE_SIZE }),
    data.getCategoryTree(),
  ]);
  const children = all.filter((c) => c.parentId === category.id).sort((a, b) => a.sortOrder - b.sortOrder);
  const crumbs = [{ name: "Home", path: "/" }, ...trail.map((c) => ({ name: c.navLabel ?? c.name, path: c.path }))];

  return (
    <div className="container-x pt-4 pb-8">
      <Breadcrumbs items={crumbs} />
      <header className="mt-4 max-w-3xl">
        <h1 className="display text-d4">{category.name}</h1>
        {category.intro && <p className="mt-3 text-lg text-fg-muted">{category.intro}</p>}
      </header>

      {children.length > 0 && (
        <nav aria-label={`${category.name} sub-categories`} className="mt-5 -mx-(--oz-gutter) overflow-x-auto px-(--oz-gutter)">
          <ul className="flex gap-2 pb-1">
            {children.map((c) => (
              <li key={c.id} className="shrink-0">
                <Link href={c.path} className="flex h-10 items-center rounded-full border border-border-strong px-4 text-sm font-medium whitespace-nowrap hover:border-fg hover:bg-bg-subtle">
                  {c.navLabel ?? c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        {page.facets && page.facets.length > 0 ? (
          <aside className="hidden lg:block">
            <FilterSidebar facets={page.facets} opts={opts} />
          </aside>
        ) : (
          <div className="hidden lg:block" />
        )}
        <div>
          <ListingToolbar facets={page.facets ?? []} opts={opts} total={page.total} />
          <div className="mt-4">
            <ProductGrid key={JSON.stringify(opts)} initial={page.items} opts={opts} total={page.total} pageSize={page.pageSize} listingKey={`category:${category.id}`} />
            <Pagination path={category.path} opts={opts} total={page.total} pageSize={page.pageSize} />
          </div>
        </div>
      </div>

      {(category.bodyHtml || category.faqs.length > 0) && (
        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          {category.bodyHtml && (
            <section aria-label={`About ${category.name}`} className="prose-oz" dangerouslySetInnerHTML={{ __html: category.bodyHtml }} />
          )}
          {category.faqs.length > 0 && (
            <section aria-labelledby="cat-faq">
              <h2 id="cat-faq" className="display mb-4 text-d3">
                {category.name} FAQs
              </h2>
              <FaqList faqs={category.faqs} />
            </section>
          )}
        </div>
      )}

      <JsonLd data={[collectionPage(category, page.items), breadcrumbList(crumbs), ...[faqPage(category.faqs)].filter((x) => x !== null)]} />
    </div>
  );
}
