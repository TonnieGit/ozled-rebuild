import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { BlogIndexView } from "@/components/views/blog-index-view";
import { CategoryView } from "@/components/views/category-view";
import { ContentView, PostView } from "@/components/views/content-view";
import { HubView } from "@/components/views/hub-view";
import { KitView } from "@/components/views/kit-view";
import { ProductView } from "@/components/views/product-view";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { data } from "@/data";
import { hasFilters, parseListParams } from "@/data/facets";
import { isIndexableFilter } from "@/seo/indexable-filters";
import { pageMetadata } from "@/seo/metadata";
import { pathToSlug, slugToPath, toggleSlash } from "@/lib/paths";

/**
 * One catch-all route resolves every storefront URL against the slug index
 * (SPEC §13): category | product | hub | kit | content | post. Each type has one
 * template; pages are generated from data, never hand-built.
 */
const BLOG_INDEX_PATH = "/blog/";

export async function generateStaticParams() {
  const paths = await data.listPaths();
  return [...paths.map((p) => p.path), BLOG_INDEX_PATH].map((p) => ({ slug: pathToSlug(p) }));
}

type Props = PageProps<"/[...slug]">;

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const path = slugToPath((await params).slug);
  const sp = await searchParams;
  if (path === BLOG_INDEX_PATH) {
    return pageMetadata({ title: "LED Lighting Guides & News | OzLED", description: "Buying guides, product news and install advice for LED tail lights, trailer lights, light bars and emergency lighting from the OzLED team.", path });
  }
  const hit = await data.resolvePath(path);
  if (!hit) return {};
  switch (hit.type) {
    case "product": {
      const p = (await data.getProduct(path))!;
      return pageMetadata({ ...p.seo, path, image: p.images[0] });
    }
    case "category": {
      const c = (await data.getCategory(path))!;
      const opts = parseListParams(sp);
      const filtered = hasFilters(opts);
      const indexable = !filtered || isIndexableFilter(path, opts);
      // Filtered URLs: noindex,follow + canonical to the clean category (SPEC §7.4).
      const canonicalPath = filtered && !indexable ? path : path + (opts.page && opts.page > 1 && !filtered ? `?page=${opts.page}` : "");
      return pageMetadata({ ...c.seo, path: canonicalPath, image: c.image, noindex: filtered && !indexable });
    }
    case "hub": {
      const h = (await data.getApplicationHub(path))!;
      return pageMetadata({ ...h.seo, path, image: h.heroImage });
    }
    case "kit": {
      const k = (await data.getKit(path))!;
      return pageMetadata({ ...k.seo, path, image: k.heroImage });
    }
    case "content": {
      const c = (await data.getContentPage(path))!;
      return pageMetadata({ ...c.seo, path });
    }
    case "post": {
      const b = (await data.getBlogPost(path))!;
      return pageMetadata({ ...b.seo, path, image: b.image, type: "article" });
    }
  }
}

export default function Page(props: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Resolved {...props} />
    </Suspense>
  );
}

async function Resolved({ params, searchParams }: Props) {
  const path = slugToPath((await params).slug);
  if (path === BLOG_INDEX_PATH) return <BlogIndexView />;

  const hit = await data.resolvePath(path);
  if (!hit) {
    // One-hop canonicalisation of the other trailing-slash form.
    if (await data.resolvePath(toggleSlash(path))) permanentRedirect(toggleSlash(path));
    notFound();
  }

  switch (hit.type) {
    case "product": {
      const p = await data.getProduct(path);
      return p ? <ProductView product={p} /> : notFound();
    }
    case "category": {
      const c = await data.getCategory(path);
      if (!c) notFound();
      // No indexable empty listings (SPEC §8.3).
      const all = await data.getProductsByCategory(c.id, { pageSize: 1 });
      if (all.total === 0) notFound();
      return <CategoryView category={c} opts={parseListParams(await searchParams)} />;
    }
    case "hub": {
      const h = await data.getApplicationHub(path);
      return h ? <HubView hub={h} /> : notFound();
    }
    case "kit": {
      const k = await data.getKit(path);
      return k ? <KitView kit={k} /> : notFound();
    }
    case "content": {
      const c = await data.getContentPage(path);
      return c ? <ContentView page={c} /> : notFound();
    }
    case "post": {
      const b = await data.getBlogPost(path);
      return b ? <PostView post={b} /> : notFound();
    }
  }
}
