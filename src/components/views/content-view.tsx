import Image from "next/image";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { JsonLd } from "@/components/ui/json-ld";
import type { BlogPost, ContentPage } from "@/data/types";
import { dateLabel } from "@/lib/format";
import { blogPosting, breadcrumbList } from "@/seo/jsonld";

export function ContentView({ page }: { page: ContentPage }) {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: page.title, path: page.path },
  ];
  return (
    <div className="container-x pt-4 pb-8">
      <Breadcrumbs items={crumbs} />
      <article className="mt-6">
        <h1 className="display text-d4">{page.title}</h1>
        {page.summary && <p className="mt-3 max-w-3xl text-lg text-fg-muted">{page.summary}</p>}
        <div className="prose-oz mt-8" dangerouslySetInnerHTML={{ __html: page.bodyHtml }} />
        <p className="mt-10 text-sm text-fg-subtle">Last updated {dateLabel(page.updatedAt)}</p>
      </article>
      <JsonLd data={breadcrumbList(crumbs)} />
    </div>
  );
}

export function PostView({ post }: { post: BlogPost }) {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/blog/" },
    { name: post.title, path: post.path },
  ];
  return (
    <div className="container-x pt-4 pb-8">
      <Breadcrumbs items={crumbs} />
      <article className="mx-auto mt-6 max-w-3xl">
        <h1 className="display text-d4">{post.title}</h1>
        <p className="mt-4 text-lg text-fg-muted">{post.excerpt}</p>
        <p className="mt-4 text-sm text-fg-muted">
          By <strong className="text-fg">{post.author.name}</strong>, {post.author.role} · Published {dateLabel(post.publishedAt)}
          {post.reviewedAt !== post.publishedAt && <> · Reviewed {dateLabel(post.reviewedAt)}</>}
        </p>
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-lg bg-bg-subtle">
          <Image src={post.image.src} alt={post.image.alt} fill priority sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
        </div>
        <div className="prose-oz mt-8 max-w-none" dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />
      </article>
      <JsonLd data={[blogPosting(post), breadcrumbList(crumbs)]} />
    </div>
  );
}
