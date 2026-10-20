"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/icon";
import type { ProductCard } from "@/data/types";
import { money } from "@/lib/format";

interface Results {
  products: ProductCard[];
  categories: { title: string; path: string }[];
  guides: { title: string; path: string }[];
  total?: number;
}

const EMPTY: Results = { products: [], categories: [], guides: [] };

/** Header search with an instant results panel (combobox pattern, SPEC §7.8). */
export function SearchBox({ variant = "header" }: { variant?: "header" | "page" }) {
  const [q, setQ] = useState("");
  const [fetched, setResults] = useState<Results>(EMPTY);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const router = useRouter();
  const id = useId();
  const root = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal })
        .then((r) => r.json() as Promise<Results>)
        .then((r) => {
          setResults(r);
          setActive(-1);
        })
        .catch(() => {});
    }, 140);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const results = q.trim().length < 2 ? EMPTY : fetched;
  const options = [
    ...results.products.map((p) => ({ href: p.path, key: p.sku })),
    ...results.categories.map((c) => ({ href: c.path, key: c.path })),
    ...results.guides.map((g) => ({ href: g.path, key: g.path })),
  ];
  const showPanel = open && q.trim().length >= 2;
  const optId = (i: number) => `${id}-opt-${i}`;

  return (
    <form
      ref={root}
      role="search"
      action="/search"
      className="relative w-full"
      onSubmit={(e) => {
        if (active >= 0 && options[active]) {
          e.preventDefault();
          router.push(options[active].href);
          setOpen(false);
        }
      }}
    >
      <label htmlFor={`${id}-q`} className="sr-only">
        Search products
      </label>
      <div className="relative">
        <Icon name="search" size={18} className={variant === "header" ? "pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-500" : "pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-fg-subtle"} />
        <input
          id={`${id}-q`}
          name="q"
          type="search"
          autoComplete="off"
          placeholder="Search tail lights, light bars, plugs…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(options.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(-1, a - 1));
            } else if (e.key === "Escape") setOpen(false);
          }}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? optId(active) : undefined}
          className={
            variant === "header"
              ? "h-11 w-full rounded-md border border-transparent bg-white pr-3 pl-10 text-[15px] text-neutral-950 placeholder:text-neutral-500 focus:border-brand focus:outline-none"
              : "h-12 w-full rounded-md border border-border-strong bg-surface pr-3 pl-10 text-fg placeholder:text-fg-subtle focus:border-action focus:outline-none"
          }
        />
      </div>

      {showPanel && (
        <div id={`${id}-list`} role="listbox" aria-label="Search suggestions" className="absolute inset-x-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-lg border border-border bg-surface text-fg shadow-lg">
          {options.length === 0 ? (
            <p className="p-4 text-sm text-fg-muted">
              No quick matches. Press Enter to search everything, or try{" "}
              <Link href="/ute-tray-lights/" className="text-link underline">
                ute & tray lighting
              </Link>
              .
            </p>
          ) : (
            <>
              {results.products.length > 0 && (
                <div className="p-2">
                  <p className="eyebrow px-2 py-1 text-fg-subtle">Products</p>
                  {results.products.map((p, i) => (
                    <Link
                      key={p.sku}
                      id={optId(i)}
                      role="option"
                      aria-selected={active === i}
                      href={p.path}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-md p-2 hover:bg-bg-subtle aria-selected:bg-bg-muted"
                    >
                      <span className="relative size-12 shrink-0 overflow-hidden rounded bg-bg-subtle">
                        <Image src={p.images[0].src} alt="" fill sizes="48px" className="object-contain" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 text-sm font-medium">{p.name}</span>
                        <span className="text-xs text-fg-subtle">{p.brand.name}</span>
                      </span>
                      <span className="text-sm font-semibold tabular-nums">{money(p.price)}</span>
                    </Link>
                  ))}
                </div>
              )}
              {results.categories.length > 0 && (
                <div className="border-t border-border p-2">
                  <p className="eyebrow px-2 py-1 text-fg-subtle">Categories</p>
                  {results.categories.map((c, i) => {
                    const n = results.products.length + i;
                    return (
                      <Link key={c.path} id={optId(n)} role="option" aria-selected={active === n} href={c.path} onClick={() => setOpen(false)} className="block rounded-md px-2 py-2 text-sm hover:bg-bg-subtle aria-selected:bg-bg-muted">
                        {c.title}
                      </Link>
                    );
                  })}
                </div>
              )}
              {results.guides.length > 0 && (
                <div className="border-t border-border p-2">
                  <p className="eyebrow px-2 py-1 text-fg-subtle">Guides</p>
                  {results.guides.map((g, i) => {
                    const n = results.products.length + results.categories.length + i;
                    return (
                      <Link key={g.path} id={optId(n)} role="option" aria-selected={active === n} href={g.path} onClick={() => setOpen(false)} className="block rounded-md px-2 py-2 text-sm hover:bg-bg-subtle aria-selected:bg-bg-muted">
                        {g.title}
                      </Link>
                    );
                  })}
                </div>
              )}
              <button type="submit" className="flex w-full items-center justify-center gap-2 border-t border-border p-3 text-sm font-semibold text-link hover:bg-bg-subtle">
                See all results for “{q.trim()}” <Icon name="arrowRight" size={16} />
              </button>
            </>
          )}
        </div>
      )}
    </form>
  );
}
