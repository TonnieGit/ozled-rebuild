import type { ListOpts } from "@/data/types";

/**
 * Curated filter pages that may be indexed (SPEC §7.4), e.g. "12–24V tail lights".
 * Everything else filtered is noindex,follow. Add entries only for filter combos
 * with real search demand (check Semrush first).
 */
const ALLOWLIST: { path: string; filters: Record<string, string[]> }[] = [
  { path: "/led-tail-lights/", filters: { voltage: ["12-24v"] } },
  { path: "/led-tail-lights/", filters: { application: ["trailer"] } },
];

export function isIndexableFilter(path: string, opts: ListOpts): boolean {
  const active = Object.fromEntries(Object.entries(opts.filters ?? {}).filter(([, v]) => v.length));
  return ALLOWLIST.some(
    (a) =>
      a.path === path &&
      Object.keys(a.filters).length === Object.keys(active).length &&
      Object.entries(a.filters).every(([k, v]) => active[k]?.length === v.length && v.every((x) => active[k].includes(x))),
  );
}
