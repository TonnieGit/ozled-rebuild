/**
 * JSON-LD builders (SPEC §8.4). Plain objects; render with <JsonLd>. Each
 * builder only emits properties backed by real data (no empty ratings etc.).
 */
import type { BlogPost, Category, Faq, Product, ProductCard, Video } from "@/data/types";
import type { SiteInfo } from "@/lib/site-types";
import { stripHtml } from "@/data/neto/mappers";
import { absoluteUrl, SITE_URL } from "./metadata";

const ORG_ID = `${SITE_URL}/#organization`;

const AVAILABILITY: Record<Product["stock"], string> = {
  in_stock: "https://schema.org/InStock",
  low: "https://schema.org/LimitedAvailability",
  backorder: "https://schema.org/BackOrder",
  out: "https://schema.org/OutOfStock",
};

export function organization(site: SiteInfo) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: site.name,
    legalName: site.legalName,
    url: `${SITE_URL}/`,
    logo: absoluteUrl("/brand/ozled-logo.png"),
    ...(site.foundingYear && { foundingDate: String(site.foundingYear) }),
    ...(site.phone && { telephone: site.phone.label }),
    ...(site.email && { email: site.email }),
    ...(site.socials.length && { sameAs: site.socials.map((s) => s.url) }),
  };
}

export function website() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: "OzLED",
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function localBusiness(site: SiteInfo) {
  if (!site.address) return null;
  return {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    "@id": `${SITE_URL}/#store`,
    name: `${site.name} ${site.address.locality} showroom`,
    url: `${SITE_URL}/`,
    image: absoluteUrl("/brand/ozled-logo.png"),
    parentOrganization: { "@id": ORG_ID },
    ...(site.phone && { telephone: site.phone.label }),
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      postalCode: site.address.postcode,
      addressCountry: site.address.country,
    },
    ...(site.geo && { geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng } }),
    ...(site.hours.length && {
      openingHoursSpecification: site.hours.map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.days,
        opens: h.opens,
        closes: h.closes,
      })),
    }),
  };
}

export function breadcrumbList(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absoluteUrl(c.path) })),
  };
}

export function collectionPage(category: Category, cards: ProductCard[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.intro,
    url: absoluteUrl(category.path),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: cards.length,
      itemListElement: cards.map((c, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(c.path), name: c.name })),
    },
  };
}

export function product(p: Product, site: SiteInfo) {
  const offer = {
    "@type": "Offer",
    url: absoluteUrl(p.path),
    priceCurrency: "AUD",
    price: p.price.toFixed(2),
    availability: AVAILABILITY[p.stock],
    itemCondition: "https://schema.org/NewCondition",
    seller: { "@id": ORG_ID },
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingDestination: { "@type": "DefinedRegion", addressCountry: "AU" },
      ...(site.freeShippingFrom && p.price >= site.freeShippingFrom
        ? { shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "AUD" } }
        : {}),
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
        transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 7, unitCode: "DAY" },
      },
    },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "AU",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 30,
      returnMethod: "https://schema.org/ReturnByMail",
      url: absoluteUrl("/returns-policy"),
    },
  };
  const r = p.reviews.summary;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.sku,
    ...(p.mpn && { mpn: p.mpn }),
    ...(p.gtin && { gtin: p.gtin }),
    brand: { "@type": "Brand", name: p.brand.name },
    description: p.summary,
    image: p.images.map((i) => absoluteUrl(i.src)),
    url: absoluteUrl(p.path),
    ...(p.specs.adrApprovals?.length && {
      additionalProperty: [
        ...p.specs.adrApprovals.map((a) => ({ "@type": "PropertyValue", name: "ADR approval", value: a })),
        ...(p.specs.ipRating ? [{ "@type": "PropertyValue", name: "IP rating", value: p.specs.ipRating }] : []),
      ],
    }),
    offers: offer,
    ...(r.count > 0 && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: r.average.toFixed(1), reviewCount: r.count, bestRating: 5, worstRating: 1 },
      review: p.reviews.items.slice(0, 5).map((rv) => ({
        "@type": "Review",
        author: { "@type": "Person", name: rv.author },
        datePublished: rv.date,
        reviewRating: { "@type": "Rating", ratingValue: rv.rating, bestRating: 5 },
        ...(rv.title && { name: rv.title }),
        reviewBody: rv.body,
      })),
    }),
  };
}

export function faqPage(faqs: Faq[]) {
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
}

export function blogPosting(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: absoluteUrl(post.image.src),
    url: absoluteUrl(post.path),
    datePublished: post.publishedAt,
    dateModified: post.reviewedAt,
    author: { "@type": "Person", name: post.author.name, jobTitle: post.author.role },
    publisher: { "@id": ORG_ID },
    wordCount: stripHtml(post.bodyHtml).split(" ").length,
  };
}

export function videoObject(v: Video, uploadDate: string) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: v.title,
    description: v.title,
    thumbnailUrl: `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${v.youtubeId}`,
    contentUrl: `https://www.youtube.com/watch?v=${v.youtubeId}`,
    uploadDate,
  };
}
