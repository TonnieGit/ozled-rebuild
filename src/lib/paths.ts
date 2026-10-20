/** Mirror of proxy.ts's marker; kept here so app code doesn't import the proxy module. */
export const TRAILING_SLASH_MARKER = "__ts";

/** Catch-all params → exact legacy path. ["led-tail-lights","__ts"] → "/led-tail-lights/" */
export function slugToPath(slug: string[]): string {
  const parts = slug.map((s) => decodeURIComponent(s));
  if (parts[parts.length - 1] === TRAILING_SLASH_MARKER) return `/${parts.slice(0, -1).join("/")}/`;
  return `/${parts.join("/")}`;
}

/** Exact legacy path → catch-all params (for generateStaticParams). */
export function pathToSlug(path: string): string[] {
  const trimmed = path.replace(/^\/+/, "");
  if (trimmed.endsWith("/")) return [...trimmed.slice(0, -1).split("/"), TRAILING_SLASH_MARKER];
  return trimmed.split("/");
}

/** The same path with its trailing slash toggled, for one-hop canonicalising redirects. */
export function toggleSlash(path: string): string {
  return path.endsWith("/") ? path.slice(0, -1) : `${path}/`;
}
