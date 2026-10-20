import Link from "next/link";
import { Icon } from "@/components/icon";
import { BuyBox } from "@/components/product/buy-box";
import { Price, Rating, SpecChips } from "@/components/product/bits";
import { Gallery } from "@/components/product/gallery";
import { LiteYouTube } from "@/components/product/lite-youtube";
import { ProductCard } from "@/components/product/product-card";
import { SpecsTable } from "@/components/product/specs";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FaqList } from "@/components/ui/faq-list";
import { JsonLd } from "@/components/ui/json-ld";
import { Section } from "@/components/ui/section";
import { data } from "@/data";
import { FACETS } from "@/data/facets";
import type { DocumentKind, Product } from "@/data/types";
import { commerceUrl } from "@/lib/commerce";
import { dateLabel } from "@/lib/format";
import { getSite } from "@/lib/site";
import { breadcrumbList, faqPage, product as productLd, videoObject } from "@/seo/jsonld";
import { categoryTrail } from "./trail";

const DOC_LABEL: Record<DocumentKind, string> = {
  datasheet: "Datasheet",
  "fitting-instructions": "Fitting instructions",
  "wiring-diagram": "Wiring diagram",
  "adr-certificate": "ADR certificate",
  "flash-patterns": "Flash patterns",
  warranty: "Warranty",
  brochure: "Brochure",
  other: "Document",
};

export async function ProductView({ product: p }: { product: Product }) {
  const site = getSite();
  const [trail, compatible] = await Promise.all([categoryTrail(p.primaryCategoryId), data.getProductCards(p.compatibleWith)]);
  // "You'll also need": in stock and buyable only; never push backordered cross-sells (SPEC §7.3).
  const alsoNeed = compatible.filter((c) => (c.stock === "in_stock" || c.stock === "low") && !c.restricted).slice(0, 4);
  const crumbs = [{ name: "Home", path: "/" }, ...trail.map((c) => ({ name: c.navLabel ?? c.name, path: c.path })), { name: p.name, path: p.path }];
  const quoteHref = commerceUrl(`/form/register-trade/?sku=${encodeURIComponent(p.sku)}`);
  const hasSuits = p.applications.length > 0 || p.specs.mount?.length || p.specs.connector;
  const r = p.reviews.summary;

  return (
    <div className="container-x pt-4 pb-8">
      <Breadcrumbs items={crumbs} />

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
        <Gallery images={p.images} name={p.name} />

        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm font-semibold tracking-wide text-fg-muted uppercase">
              {p.brand.path ? (
                <Link href={p.brand.path} className="hover:underline">
                  {p.brand.name}
                </Link>
              ) : (
                p.brand.name
              )}
            </p>
            <h1 className="mt-1 text-2xl leading-tight font-bold tracking-tight md:text-3xl">{p.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              {r.count > 0 && (
                <a href="#reviews" className="hover:underline">
                  <Rating average={r.average} count={r.count} />
                </a>
              )}
              <p className="sku text-fg-subtle">SKU {p.sku}</p>
            </div>
          </div>

          <Price price={p.price} rrp={p.rrp} size="lg" />
          {!p.restricted && p.price >= 0 && <p className="-mt-3 text-sm text-fg-muted">or 4 interest-free payments of ${(p.price / 4).toFixed(2)} with Afterpay</p>}

          <SpecChips specs={p.specs} max={5} size="md" />

          <BuyBox
            product={{ sku: p.sku, name: p.name, price: p.price, path: p.path, stock: p.stock, pickupAvailable: p.pickupAvailable, restricted: p.restricted, image: p.images[0]?.src }}
            quoteHref={quoteHref}
            pickupLocality={site.address?.locality}
          />

          <ul className="space-y-2 rounded-lg bg-bg-subtle p-4 text-sm">
            <li className="flex gap-2">
              <Icon name="truck" size={18} className="shrink-0 text-fg-muted" />
              <span>
                {site.freeShippingFrom ? <>Free shipping over ${site.freeShippingFrom}, excludes some remote postcodes.</> : "Fast dispatch Australia-wide."}{" "}
                <Link href="/shipping-details-terms-conditions" className="text-link underline">
                  Shipping details
                </Link>
              </span>
            </li>
            <li className="flex gap-2">
              <Icon name="user" size={18} className="shrink-0 text-fg-muted" />
              <span>
                Trade or member? Your price is applied at checkout.{" "}
                <a href={commerceUrl("/_myacct")} className="text-link underline">
                  Sign in
                </a>{" "}
                or{" "}
                <Link href="/trade/" className="text-link underline">
                  apply for trade
                </Link>
                .
              </span>
            </li>
          </ul>

          <p className="text-[15px] leading-relaxed">{p.summary}</p>
        </div>
      </div>

      <nav aria-label="On this page" className="sticky top-(--oz-header-h) z-10 -mx-(--oz-gutter) mt-12 overflow-x-auto border-y border-border bg-bg/95 px-(--oz-gutter) backdrop-blur">
        <ul className="flex gap-6 text-sm font-semibold whitespace-nowrap">
          {[
            ["specs", "Specs"],
            hasSuits && ["suits", "Will it suit?"],
            alsoNeed.length && ["also-need", "You’ll also need"],
            ["details", "Details"],
            p.documents.length && ["downloads", "Downloads"],
            p.videos.length && ["video", "Video"],
            ["reviews", "Reviews"],
            p.faqs.length && ["faqs", "FAQs"],
          ]
            .filter((x): x is [string, string] => Array.isArray(x))
            .map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="block py-3 text-fg-muted hover:text-fg">
                  {label}
                </a>
              </li>
            ))}
        </ul>
      </nav>

      <div className="mt-10 grid gap-14">
        <Section id="specs" title="Key specs">
          <SpecsTable specs={p.specs} />
        </Section>

        {hasSuits && (
          <Section id="suits" title="Will it suit my build?">
            <div className="grid gap-4 md:grid-cols-3">
              {p.applications.length > 0 && (
                <div className="rounded-lg border border-border p-5">
                  <h3 className="font-semibold">Made for</h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {p.applications.map((a) => (
                      <li key={a} className="rounded-pill rounded-full bg-bg-muted px-3 py-1 text-sm font-medium">
                        {FACETS.application.valueLabel(a)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {p.specs.mount?.length ? (
                <div className="rounded-lg border border-border p-5">
                  <h3 className="font-semibold">Mounting</h3>
                  <p className="mt-3 text-sm text-fg-muted">{p.specs.mount.map((m) => FACETS.mount.valueLabel(m)).join(", ")} mount.</p>
                </div>
              ) : null}
              {p.specs.connector && (
                <div className="rounded-lg border border-border p-5">
                  <h3 className="font-semibold">Wiring</h3>
                  <p className="mt-3 text-sm text-fg-muted">
                    {FACETS.connector.valueLabel(p.specs.connector)}
                    {p.specs.connector === "plug-and-play" ? ": connects to a matching harness with no cutting or splicing." : "."}
                  </p>
                </div>
              )}
            </div>
          </Section>
        )}

        {alsoNeed.length > 0 && (
          <Section id="also-need" title="You’ll also need" eyebrow="Complete the install">
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {alsoNeed.map((c) => (
                <li key={c.sku}>
                  <ProductCard card={c} />
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section id="details" title="Product details">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="prose-oz" dangerouslySetInnerHTML={{ __html: p.descriptionHtml }} />
            {p.features.length > 0 && (
              <aside className="h-fit rounded-lg bg-bg-subtle p-5">
                <h3 className="font-semibold">Features</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Icon name="check" size={16} className="mt-0.5 shrink-0 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>
              </aside>
            )}
          </div>
        </Section>

        {p.documents.length > 0 && (
          <Section id="downloads" title="Downloads">
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {p.documents.map((d) => (
                <li key={d.url}>
                  <a href={d.url} className="flex items-center gap-4 rounded-lg border border-border p-4 hover:border-border-strong hover:bg-bg-subtle" rel="noopener">
                    <span className="grid size-11 shrink-0 place-items-center rounded-md bg-bg-muted text-action">
                      <Icon name="file" size={22} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{d.title}</span>
                      <span className="block text-sm text-fg-muted">
                        {DOC_LABEL[d.kind]} · {d.fileType.toUpperCase()}
                        {d.sizeKb ? ` · ${d.sizeKb >= 1024 ? `${(d.sizeKb / 1024).toFixed(1)} MB` : `${d.sizeKb} KB`}` : ""}
                      </span>
                    </span>
                    <Icon name="download" size={20} className="text-fg-muted" />
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {p.videos.length > 0 && (
          <Section id="video" title="Video">
            <div className="grid gap-4 md:grid-cols-2">
              {p.videos.map((v) => (
                <LiteYouTube key={v.youtubeId} id={v.youtubeId} title={v.title} />
              ))}
            </div>
          </Section>
        )}

        <Section id="reviews" title="Reviews">
          {r.count > 0 ? (
            <div className="grid gap-8 md:grid-cols-[260px_1fr]">
              <div>
                <p className="text-5xl font-bold">{r.average.toFixed(1)}</p>
                <Rating average={r.average} count={r.count} size="md" />
                <ul className="mt-4 space-y-1.5 text-sm">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const n = r.distribution[star - 1];
                    return (
                      <li key={star} className="flex items-center gap-2">
                        <span className="w-6 tabular-nums">{star}★</span>
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-bg-muted">
                          <span className="block h-full bg-signal" style={{ width: `${(n / r.count) * 100}%` }} />
                        </span>
                        <span className="w-8 text-right text-fg-muted tabular-nums">{n}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <ul className="divide-y divide-border">
                {p.reviews.items.map((rv) => (
                  <li key={rv.id} className="py-4 first:pt-0">
                    <Rating average={rv.rating} count={1} />
                    {rv.title && <h3 className="mt-1 font-semibold">{rv.title}</h3>}
                    <p className="mt-1 text-fg-muted">{rv.body}</p>
                    <p className="mt-2 text-xs text-fg-subtle">
                      {rv.author} · {dateLabel(rv.date)} {rv.verified && "· Verified buyer"}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border-strong p-6 text-center">
              <p className="font-semibold">No reviews yet</p>
              <p className="mt-1 text-sm text-fg-muted">Bought this? Tell other buyers how it went.</p>
            </div>
          )}
          <a href={commerceUrl(`/_myacct/write_review?item=${encodeURIComponent(p.sku)}`)} className="mt-6 inline-flex h-11 items-center rounded-md border border-border-strong px-5 font-semibold hover:bg-bg-muted">
            Write a review
          </a>
        </Section>

        {p.faqs.length > 0 && (
          <Section id="faqs" title="Questions & answers">
            <FaqList faqs={p.faqs} headingId="faqs-h" />
          </Section>
        )}
      </div>

      <JsonLd
        data={[
          productLd(p, site),
          breadcrumbList(crumbs),
          ...[faqPage(p.faqs)].filter((x) => x !== null),
          ...p.videos.map((v) => videoObject(v, p.createdAt)),
        ]}
      />
    </div>
  );
}
