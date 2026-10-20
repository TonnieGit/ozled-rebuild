"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Icon } from "@/components/icon";
import { SORT_LABELS, toQuery } from "@/data/facets";
import type { Facet, ListOpts, SortKey } from "@/data/types";
import { cx } from "@/lib/format";

/**
 * Buyer-language filters (SPEC §7.4). Every option is a real link with the
 * filtered query string (works without JS, rel=nofollow); with JS it navigates in place.
 */
function useListingNav(opts: ListOpts) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();
  const hrefFor = (next: ListOpts) => `${pathname}${toQuery({ ...next, page: 1 })}`;
  const go = (next: ListOpts) => start(() => router.push(hrefFor(next), { scroll: false }));
  const toggle = (key: string, value: string): ListOpts => {
    const cur = opts.filters?.[key] ?? [];
    const vals = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
    return { ...opts, filters: { ...opts.filters, [key]: vals } };
  };
  return { pending, hrefFor, go, toggle };
}

function FacetPanel({ facets, opts, openCount = 4 }: { facets: Facet[]; opts: ListOpts; openCount?: number }) {
  const { pending, hrefFor, go, toggle } = useListingNav(opts);
  return (
    <div aria-busy={pending}>
      {facets.map((f, i) => (
        <details key={f.key} open={i < openCount || Boolean(opts.filters?.[f.key]?.length)} className="group border-b border-border py-2">
          <summary className="flex cursor-pointer list-none items-center justify-between py-2 font-semibold [&::-webkit-details-marker]:hidden">
            {f.label}
            <Icon name="chevronDown" size={18} className="transition-transform group-open:rotate-180" />
          </summary>
          <ul className="space-y-0.5 pb-2">
            {f.values.map((v) => {
              const on = opts.filters?.[f.key]?.includes(v.value) ?? false;
              const next = toggle(f.key, v.value);
              return (
                <li key={v.value}>
                  <a
                    href={hrefFor(next)}
                    onClick={(e) => {
                      e.preventDefault();
                      go(next);
                    }}
                    role="checkbox"
                    aria-checked={on}
                    rel="nofollow"
                    className={cx("flex min-h-10 items-center gap-3 rounded-md px-1 text-sm hover:bg-bg-subtle", v.count === 0 && !on && "opacity-50")}
                  >
                    <span className={cx("grid size-5 shrink-0 place-items-center rounded-sm border", on ? "border-action bg-action text-white" : "border-border-strong")}>
                      {on && <Icon name="check" size={14} />}
                    </span>
                    <span className="flex-1">{v.label}</span>
                    <span className="text-xs text-fg-subtle tabular-nums">{v.count}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </details>
      ))}
    </div>
  );
}

/** Desktop sidebar. */
export function FilterSidebar({ facets, opts }: { facets: Facet[]; opts: ListOpts }) {
  return (
    <div role="group" aria-label="Filters">
      <FacetPanel facets={facets} opts={opts} openCount={5} />
    </div>
  );
}

/** Toolbar: count, sort, active filter chips, and the mobile filter sheet. */
export function ListingToolbar({ facets, opts, total }: { facets: Facet[]; opts: ListOpts; total: number }) {
  const { go, toggle } = useListingNav(opts);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (mobileOpen && !d.open) d.showModal();
    if (!mobileOpen && d.open) d.close();
  }, [mobileOpen]);

  const selected = Object.entries(opts.filters ?? {}).flatMap(([key, vals]) =>
    vals.map((v) => ({ key, value: v, label: facets.find((f) => f.key === key)?.values.find((x) => x.value === v)?.label ?? v })),
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {facets.length > 0 && (
            <button type="button" onClick={() => setMobileOpen(true)} className="flex h-11 items-center gap-2 rounded-md border border-border-strong px-4 font-semibold lg:hidden">
              <Icon name="filter" size={18} /> Filters{selected.length ? ` (${selected.length})` : ""}
            </button>
          )}
          <p className="text-sm text-fg-muted" aria-live="polite">
            {total} {total === 1 ? "product" : "products"}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-fg-muted">Sort by</span>
          <select
            value={opts.sort ?? "best"}
            onChange={(e) => go({ ...opts, sort: e.target.value as SortKey })}
            className="h-11 rounded-md border border-border-strong bg-surface px-3 font-medium"
          >
            {Object.entries(SORT_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selected.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Active filters">
          {selected.map((s) => (
            <li key={s.key + s.value}>
              <button type="button" onClick={() => go(toggle(s.key, s.value))} className="flex h-9 items-center gap-1.5 rounded-full bg-bg-muted pr-2 pl-3 text-sm font-medium hover:bg-border">
                {s.label} <Icon name="close" size={14} label={`Remove ${s.label} filter`} />
              </button>
            </li>
          ))}
          <li>
            <button type="button" onClick={() => go({ sort: opts.sort })} className="h-9 px-2 text-sm font-semibold text-link underline">
              Clear all
            </button>
          </li>
        </ul>
      )}

      <dialog ref={dialog} onClose={() => setMobileOpen(false)} aria-label="Filters" className="m-0 h-dvh max-h-none w-full max-w-sm bg-surface p-0 text-fg backdrop:bg-black/50 lg:hidden">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="display text-d2">Filters</h2>
            <button type="button" onClick={() => setMobileOpen(false)} className="tap grid place-items-center">
              <Icon name="close" label="Close filters" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4">
            <FacetPanel facets={facets} opts={opts} />
          </div>
          <div className="border-t border-border p-4">
            <button type="button" onClick={() => setMobileOpen(false)} className="h-12 w-full rounded-md bg-action font-semibold text-action-fg">
              Show {total} {total === 1 ? "product" : "products"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
