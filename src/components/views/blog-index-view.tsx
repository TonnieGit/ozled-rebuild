import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { data } from "@/data";
import { dateLabel } from "@/lib/format";

export async function BlogIndexView() {
  const posts = await data.getBlogPosts({ pageSize: 48 });
  return (
    <div className="container-x pt-4 pb-8">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Guides", path: "/blog/" },
        ]}
      />
      <h1 className="display mt-4 text-d4">Guides & news</h1>
      <p className="mt-3 max-w-2xl text-lg text-fg-muted">Buying guides, install advice and product news from the OzLED team.</p>
      <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.items.map((p, i) => (
          <li key={p.path}>
            <Link href={p.path} className="group block">
              <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-bg-subtle">
                <Image src={p.image.src} alt={p.image.alt} fill priority={i < 3} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
              </div>
              <p className="mt-3 text-sm text-fg-subtle">{dateLabel(p.publishedAt)}</p>
              <h2 className="mt-1 text-lg font-semibold group-hover:underline">{p.title}</h2>
              <p className="mt-1 line-clamp-2 text-fg-muted">{p.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
