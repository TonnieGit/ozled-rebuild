import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { ProductCard } from "@/components/product/product-card";
import { JsonLd } from "@/components/ui/json-ld";
import { Section } from "@/components/ui/section";
import { data } from "@/data";
import { getSite } from "@/lib/site";
import { localBusiness } from "@/seo/jsonld";
import { pageMetadata } from "@/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "LED Tail Lights, Trailer & Vehicle Lighting | OzLED",
  description:
    "LED tail lights, trailer lights, light bars, work lights and emergency lighting for utes, trailers, 4WDs and fleets. Brendale QLD showroom, shipping Australia-wide.",
  path: "/",
});

async function getHome() {
  "use cache";
  cacheLife("hours");
  cacheTag("catalogue");
  const [banners, hubs, tree, best, posts] = await Promise.all([
    data.getBanners("home-hero"),
    data.getApplicationHubs(),
    data.getCategoryTree(),
    data.listProducts({ pageSize: 8, filters: { stock: ["in-stock"] } }),
    data.getBlogPosts({ pageSize: 3 }),
  ]);
  return { banners, hubs, top: tree.filter((c) => c.parentId === null && c.onMenu), best, posts };
}

export default async function HomePage() {
  const { banners, hubs, top, best, posts } = await getHome();
  const site = getSite();
  const [hero, ...secondary] = banners;
  const store = localBusiness(site);

  return (
    <>
      {/* Hero: night photography of lights doing their job (SPEC §10). One H1 (SPEC §8.3). */}
      <section className="relative isolate overflow-hidden bg-chrome text-chrome-fg">
        {hero?.image && (
          <picture>
            <source media="(min-width: 768px)" srcSet={hero.image.desktop.src} />
            <Image
              src={hero.image.mobile.src}
              alt={hero.image.mobile.alt}
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              className="-z-10 object-cover"
            />
          </picture>
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/50 to-black/20 md:bg-gradient-to-r md:from-black/85 md:via-black/50 md:to-transparent" aria-hidden />
        <div className="container-x flex min-h-[460px] flex-col justify-end py-10 md:min-h-[560px] md:justify-center md:py-16">
          <p className="eyebrow text-signal">LED vehicle lighting since {site.foundingYear ?? 1979}</p>
          <h1 className="display mt-3 max-w-3xl text-d5">{hero?.headline ?? "LED lighting built for Australian work"}</h1>
          {hero?.subhead && <p className="mt-4 max-w-xl text-lg text-neutral-200">{hero.subhead}</p>}
          <div className="mt-7 flex flex-wrap gap-3">
            {hero?.ctaUrl && (
              <Link href={hero.ctaUrl} className="inline-flex h-12 items-center gap-2 rounded-md bg-action px-6 font-semibold text-action-fg hover:bg-action-hover">
                {hero.ctaLabel ?? "Shop now"} <Icon name="arrowRight" size={18} />
              </Link>
            )}
            {hubs[0] && (
              <Link href={hubs[0].path} className="inline-flex h-12 items-center rounded-md border border-white/40 px-6 font-semibold text-white hover:bg-white/10">
                Building a tray? Start here
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Shop by job */}
      <div className="container-x mt-14 grid gap-16">
        <Section id="jobs" title="Shop by job" eyebrow="Start with what you’re building">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {hubs.map((h) => (
              <li key={h.path} className="sm:col-span-1 lg:col-span-2">
                <Link href={h.path} className="group relative isolate flex h-64 flex-col justify-end overflow-hidden rounded-lg bg-chrome p-6 text-white">
                  <Image src={h.heroImage.src} alt={h.heroImage.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="-z-10 object-cover opacity-60 transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 to-transparent" aria-hidden />
                  <h3 className="display text-d3">{h.name}</h3>
                  <p className="mt-1 line-clamp-2 max-w-md text-sm text-neutral-200">{h.summary}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold">
                    Lights, plugs & kits <Icon name="arrowRight" size={16} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="products" title="Shop by product">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {top.map((c) => (
              <li key={c.id}>
                <Link href={c.path} className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface hover:border-fg">
                  {c.image && (
                    <div className="relative aspect-[4/3] bg-bg-subtle">
                      <Image src={c.image.src} alt={c.image.alt} fill sizes="(min-width: 1024px) 20vw, 50vw" className="object-contain p-3" />
                    </div>
                  )}
                  <span className="flex items-center justify-between gap-2 p-3 font-semibold">
                    {c.navLabel ?? c.name}
                    <Icon name="chevronRight" size={16} className="shrink-0 text-fg-subtle group-hover:text-fg" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        {best.items.length > 0 && (
          <Section id="best" title="Best sellers">
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {best.items.map((c) => (
                <li key={c.sku}>
                  <ProductCard card={c} />
                </li>
              ))}
            </ul>
          </Section>
        )}

        {secondary.length > 0 && (
          <ul className="grid gap-4 md:grid-cols-2">
            {secondary.map((b) => (
              <li key={b.id}>
                <Link href={b.ctaUrl ?? "/"} className="group relative isolate flex min-h-60 flex-col justify-end overflow-hidden rounded-lg bg-chrome p-6 text-white">
                  {b.image && <Image src={b.image.desktop.src} alt={b.image.desktop.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="-z-10 object-cover opacity-70 transition-transform duration-500 group-hover:scale-105" />}
                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 to-transparent" aria-hidden />
                  <h2 className="display text-d3">{b.headline}</h2>
                  {b.subhead && <p className="mt-1 text-neutral-200">{b.subhead}</p>}
                  {b.ctaLabel && (
                    <span className="mt-3 inline-flex items-center gap-1 font-semibold">
                      {b.ctaLabel} <Icon name="arrowRight" size={16} />
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* Verifiable trust claims only (SPEC §9). */}
        <section aria-label="Why OzLED" className="grid gap-px overflow-hidden rounded-lg bg-border sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: "clock" as const, title: site.foundingYear ? `Since ${site.foundingYear}` : "Decades in lighting", body: "Supplying emergency services, fleets and tradies with vehicle lighting." },
            { icon: "store" as const, title: site.address ? `${site.address.locality} showroom` : "Showroom", body: "See lights running before you buy, and pick up orders same day." },
            { icon: "shield" as const, title: "ADR-approved range", body: "Approval numbers listed on every compliant light." },
            { icon: "truck" as const, title: site.freeShippingFrom ? `Free shipping over $${site.freeShippingFrom}` : "Australia-wide shipping", body: "Fast dispatch from Brisbane. Excludes some remote postcodes." },
          ].map((t) => (
            <div key={t.title} className="bg-surface p-6">
              <Icon name={t.icon} size={28} className="text-action" />
              <h2 className="mt-3 font-bold">{t.title}</h2>
              <p className="mt-1 text-sm text-fg-muted">{t.body}</p>
            </div>
          ))}
        </section>

        {posts.items.length > 0 && (
          <Section
            id="guides"
            title="Guides"
            action={
              <Link href="/blog/" className="flex items-center gap-1 text-sm font-semibold text-link hover:underline">
                All guides <Icon name="arrowRight" size={16} />
              </Link>
            }
          >
            <ul className="grid gap-6 md:grid-cols-3">
              {posts.items.map((p) => (
                <li key={p.path}>
                  <Link href={p.path} className="group block">
                    <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-bg-subtle">
                      <Image src={p.image.src} alt={p.image.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                    </div>
                    <h3 className="mt-3 font-semibold group-hover:underline">{p.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-fg-muted">{p.excerpt}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      {store && <JsonLd data={store} />}
    </>
  );
}
