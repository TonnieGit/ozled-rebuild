import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { ProductCard } from "@/components/product/product-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FaqList } from "@/components/ui/faq-list";
import { JsonLd } from "@/components/ui/json-ld";
import { Section } from "@/components/ui/section";
import { data } from "@/data";
import type { ApplicationHub } from "@/data/types";
import { breadcrumbList, faqPage } from "@/seo/jsonld";

/** Application hub (SPEC §7.2): a landing page that ranks and sells. */
export async function HubView({ hub }: { hub: ApplicationHub }) {
  const [kit, top, categories, posts] = await Promise.all([
    hub.featuredKitPath ? data.getKit(hub.featuredKitPath) : null,
    data.getProductsByApplication(hub.application, { pageSize: 8, filters: { stock: ["in-stock"] } }),
    Promise.all(hub.relatedCategoryPaths.map((p) => data.getCategory(p))),
    Promise.all(hub.relatedPostPaths.map((p) => data.getBlogPost(p))),
  ]);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: hub.navLabel, path: hub.path },
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-chrome text-chrome-fg">
        <Image src={hub.heroImage.src} alt={hub.heroImage.alt} fill priority sizes="100vw" className="-z-10 object-cover opacity-45" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/60 to-black/10" aria-hidden />
        <div className="container-x py-12 md:py-20">
          <div className="[&_a]:text-chrome-fg-muted [&_nav]:text-chrome-fg-muted [&_span[aria-current]]:text-chrome-fg">
            <Breadcrumbs items={crumbs} />
          </div>
          <h1 className="display mt-6 max-w-3xl text-d5">{hub.name}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-neutral-200">{hub.summary}</p>
          {kit && (
            <Link href={kit.path} className="mt-8 inline-flex h-12 items-center gap-2 rounded-md bg-action px-6 font-semibold text-action-fg hover:bg-action-hover">
              {kit.name} <Icon name="arrowRight" size={18} />
            </Link>
          )}
        </div>
      </section>

      <div className="container-x mt-14 grid gap-16">
        <Section id="checklist" title="What you need" eyebrow="The checklist">
          <ol className="grid gap-3 md:grid-cols-2">
            {hub.checklist.map((item, i) => (
              <li key={item.label}>
                <Link href={item.href} className="group flex h-full gap-4 rounded-lg border border-border p-5 hover:border-fg">
                  <span className="display grid size-10 shrink-0 place-items-center rounded-md bg-fg text-xl text-bg">{i + 1}</span>
                  <span className="flex-1">
                    <span className="flex items-center gap-2 font-semibold">
                      {item.label}
                      {!item.required && <span className="rounded-sm bg-bg-muted px-1.5 py-0.5 text-xs font-medium text-fg-muted">Optional</span>}
                    </span>
                    <span className="mt-1 block text-sm text-fg-muted">{item.description}</span>
                  </span>
                  <Icon name="chevronRight" className="self-center text-fg-subtle transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ol>
        </Section>

        {kit && (
          <section aria-labelledby="kit-h" className="grid overflow-hidden rounded-lg bg-chrome text-chrome-fg md:grid-cols-2">
            <div className="relative min-h-56">
              <Image src={kit.heroImage.src} alt={kit.heroImage.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="p-8 md:p-10">
              <p className="eyebrow text-signal">Kit builder</p>
              <h2 id="kit-h" className="display mt-2 text-d4">
                {kit.name}
              </h2>
              <p className="mt-3 text-chrome-fg-muted">{kit.summary}</p>
              <ol className="mt-5 space-y-2 text-sm">
                {kit.steps.map((s, i) => (
                  <li key={s.id} className="flex gap-3">
                    <span className="font-bold text-signal">{i + 1}</span>
                    {s.title}
                  </li>
                ))}
              </ol>
              <Link href={kit.path} className="mt-6 inline-flex h-12 items-center gap-2 rounded-md bg-action px-6 font-semibold text-action-fg hover:bg-action-hover">
                Start building <Icon name="arrowRight" size={18} />
              </Link>
            </div>
          </section>
        )}

        {top.items.length > 0 && (
          <Section
            id="top"
            title={`Top picks for ${hub.navLabel.toLowerCase()}`}
            action={
              categories[0] ? (
                <Link href={categories[0].path} className="hidden items-center gap-1 text-sm font-semibold text-link hover:underline sm:flex">
                  Shop all <Icon name="arrowRight" size={16} />
                </Link>
              ) : undefined
            }
          >
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {top.items.map((c) => (
                <li key={c.sku}>
                  <ProductCard card={c} />
                </li>
              ))}
            </ul>
          </Section>
        )}

        {categories.some(Boolean) && (
          <nav aria-labelledby="hub-cats">
            <h2 id="hub-cats" className="eyebrow text-fg-muted">
              Shop the full range
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {categories
                .filter((c) => c !== null)
                .map((c) => (
                  <li key={c.id}>
                    <Link href={c.path} className="flex h-10 items-center rounded-full border border-border-strong px-4 text-sm font-medium hover:border-fg">
                      {c.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>
        )}

        <div className="grid gap-12 lg:grid-cols-2">
          <Section id="adr" title="ADR compliance, explained">
            <div className="prose-oz" dangerouslySetInnerHTML={{ __html: hub.adrExplainerHtml }} />
          </Section>
          <Section id="faqs" title="Questions we get asked">
            <FaqList faqs={hub.faqs} headingId="faqs-h" />
          </Section>
        </div>

        {posts.some(Boolean) && (
          <Section id="guides" title="Guides">
            <ul className="grid gap-4 md:grid-cols-3">
              {posts
                .filter((p) => p !== null)
                .map((p) => (
                  <li key={p.path}>
                    <Link href={p.path} className="group block overflow-hidden rounded-lg border border-border hover:border-fg">
                      <div className="relative aspect-[16/9] bg-bg-subtle">
                        <Image src={p.image.src} alt={p.image.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold group-hover:underline">{p.title}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-fg-muted">{p.excerpt}</p>
                      </div>
                    </Link>
                  </li>
                ))}
            </ul>
          </Section>
        )}
      </div>

      <JsonLd data={[breadcrumbList(crumbs), ...[faqPage(hub.faqs)].filter((x) => x !== null)]} />
    </>
  );
}
