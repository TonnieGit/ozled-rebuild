import type { SiteInfo } from "./site-types";
import raw from "@/data/fixtures/site.json";
import { fixturePaths } from "@/data/path-index";
import { isCommercePath } from "./commerce";

/**
 * Business facts for the footer and Organization/LocalBusiness JSON-LD.
 * Source: src/data/fixtures/site.json, scraped from the live site (only what it states).
 * Normalised here so the scraped shape can evolve without touching components.
 */
type Raw = Record<string, unknown>;

const s = (v: unknown): string | undefined => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const obj = (v: unknown): Raw => (v && typeof v === "object" && !Array.isArray(v) ? (v as Raw) : {});

function phone(v: unknown): SiteInfo["phone"] {
  const label = s(v) ?? s(obj(v).label) ?? s(obj(v).display) ?? s(obj(v).number);
  if (!label) return undefined;
  const digits = label.replace(/[^\d+]/g, "");
  return { label, href: `tel:${digits.startsWith("+") ? digits : digits.replace(/^0/, "+61")}` };
}

function address(v: unknown): SiteInfo["address"] {
  const a = obj(v);
  const street = s(a.street) ?? s(a.streetAddress) ?? s(a.line1);
  const locality = s(a.locality) ?? s(a.suburb) ?? s(a.addressLocality) ?? s(a.city);
  if (!street || !locality) return undefined;
  return {
    street,
    locality,
    region: s(a.region) ?? s(a.state) ?? s(a.addressRegion) ?? "QLD",
    postcode: s(a.postcode) ?? s(a.postalCode) ?? "",
    country: s(a.country) ?? s(a.addressCountry) ?? "AU",
  };
}

const SOCIAL_LABELS: Record<string, string> = {
  "facebook.com": "Facebook",
  "instagram.com": "Instagram",
  "youtube.com": "YouTube",
  "linkedin.com": "LinkedIn",
  "g.page": "Google",
};

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function hours(v: unknown): SiteInfo["hours"] {
  return arr<Raw>(v).flatMap((h) => {
    const days = arr<string>(h.days ?? h.dayOfWeek).map((d) => DAY_NAMES.find((n) => n.toLowerCase().startsWith(String(d).toLowerCase().slice(0, 3))) ?? String(d));
    const opens = s(h.opens);
    const closes = s(h.closes);
    return days.length && opens && closes ? [{ days, opens, closes }] : [];
  });
}

/**
 * While standalone, footer links to live-site pages the pitch build doesn't have
 * go to the live site, so nothing 404s (Neto mode has every page).
 */
const LIVE = (process.env.NEXT_PUBLIC_COMMERCE_ORIGIN ?? "https://www.ozled.com.au").replace(/\/$/, "");
const known = process.env.DATA_SOURCE === "neto" ? null : fixturePaths();
function resolveHref(path: string): string {
  if (!known || isCommercePath(path) || known.has(path)) return path;
  return `${LIVE}${path}`;
}

function links(v: unknown): { label: string; href: string }[] {
  return arr<Raw>(v).flatMap((l) => {
    const label = s(l.label) ?? s(l.text) ?? s(l.name);
    const href = s(l.href) ?? s(l.path) ?? s(l.url);
    if (!label || !href) return [];
    try {
      const u = new URL(href, "https://www.ozled.com.au");
      return [{ label, href: u.hostname === "www.ozled.com.au" ? resolveHref(u.pathname) + u.search : u.toString() }];
    } catch {
      return [];
    }
  });
}

function build(r: Raw): SiteInfo {
  const footerRaw = r.footer ?? r.footerLinks ?? r.footerGroups;
  const footer = arr<Raw>(footerRaw)
    .map((g) => ({ title: s(g.title) ?? s(g.heading) ?? s(g.label) ?? "", links: links(g.links) }))
    .filter((g) => g.title && g.links.length);
  const geo = obj(r.geo);
  const lat = Number(geo.lat ?? geo.latitude);
  const lng = Number(geo.lng ?? geo.lon ?? geo.longitude);
  return {
    name: s(r.name) ?? "OzLED",
    legalName: s(r.legalName) ?? s(r.name) ?? "OzLED",
    url: "https://www.ozled.com.au",
    abn: s(r.abn) ?? s(r.ABN),
    phone: phone(r.phone ?? r.telephone),
    email: s(r.email),
    address: address(r.address ?? r.showroom),
    geo: Number.isFinite(lat) && Number.isFinite(lng) && (lat || lng) ? { lat, lng } : undefined,
    hours: hours(r.openingHours ?? r.hours),
    socials: [...arr<unknown>(r.socials ?? r.social ?? r.socialProfiles), ...arr<unknown>(r.sameAs)].flatMap((x) => {
      const o = typeof x === "string" ? { url: x } : obj(x);
      const url = s(o.url) ?? s(o.href);
      if (!url) return [];
      const host = new URL(url).hostname.replace(/^www\./, "");
      const label = s(o.label) ?? s(o.name) ?? SOCIAL_LABELS[host] ?? host;
      return [{ label, url }];
    }).filter((x, i, all) => all.findIndex((y) => y.label === x.label) === i),
    foundingYear: Number(r.foundingYear ?? r.founded) || undefined,
    paymentMethods: arr<unknown>(r.paymentMethods).map(String),
    freeShippingFrom: Number(obj(r.shipping).freeShippingThresholdAud ?? obj(r.freeShipping).threshold ?? r.freeShippingThreshold ?? r.freeShippingFrom) || undefined,
    footer,
  };
}

const site = build(raw as Raw);

export function getSite(): SiteInfo {
  return site;
}
