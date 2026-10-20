/**
 * Links into Neto-owned pages (account, cart, forms). On the same-domain setup
 * (SPEC §3.1) these stay relative; while the storefront runs standalone they
 * point at the live Neto store so they still work.
 */
const ORIGIN = (process.env.NEXT_PUBLIC_COMMERCE_ORIGIN ?? "").replace(/\/$/, "");

const COMMERCE_PREFIXES = ["/_mycart", "/_myacct", "/myacct", "/purchase", "/form/", "/do/", "/ajax/"];

export function isCommercePath(href: string): boolean {
  return COMMERCE_PREFIXES.some((p) => href.startsWith(p));
}

export function commerceUrl(path: string): string {
  return ORIGIN && isCommercePath(path) ? `${ORIGIN}${path}` : path;
}
