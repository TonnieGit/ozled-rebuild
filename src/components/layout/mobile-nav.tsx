"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { commerceUrl } from "@/lib/commerce";
import type { NavData } from "./nav-data";

/** Full-screen mobile menu with the two entry points as tabs (SPEC §7.1). */
export function MobileNav({ nav, phone }: { nav: NavData; phone?: { label: string; href: string } }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"jobs" | "products">("jobs");
  const [expanded, setExpanded] = useState<string | null>(null);
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  // Close on navigation (render-time reset, not an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="tap -ml-2 grid place-items-center text-chrome-fg lg:hidden">
        <Icon name="menu" size={24} label="Open menu" />
      </button>
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        aria-label="Menu"
        className="m-0 h-dvh max-h-none w-full max-w-none bg-chrome p-0 text-chrome-fg backdrop:bg-black/60"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-between border-b border-chrome-border px-4">
            <span className="display text-d2">Menu</span>
            <button type="button" onClick={() => setOpen(false)} className="tap -mr-2 grid place-items-center">
              <Icon name="close" size={24} label="Close menu" />
            </button>
          </div>
          <div role="tablist" aria-label="Browse by" className="grid grid-cols-2 border-b border-chrome-border">
            {(
              [
                ["jobs", "Shop by job"],
                ["products", "Shop by product"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                role="tab"
                type="button"
                id={`tab-${key}`}
                aria-selected={tab === key}
                aria-controls={`panel-${key}`}
                onClick={() => setTab(key)}
                className="h-12 font-semibold text-chrome-fg-muted aria-selected:text-white aria-selected:shadow-[inset_0_-3px_0_var(--oz-color-brand)]"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            <ul id="panel-jobs" role="tabpanel" aria-labelledby="tab-jobs" hidden={tab !== "jobs"} className="divide-y divide-chrome-border">
              {nav.jobs.map((j) => (
                <li key={j.href}>
                  <Link href={j.href} className="block px-4 py-4">
                    <span className="display block text-d2">{j.label}</span>
                    {j.description && <span className="mt-1 block text-sm text-chrome-fg-muted">{j.description}</span>}
                  </Link>
                </li>
              ))}
            </ul>
            <ul id="panel-products" role="tabpanel" aria-labelledby="tab-products" hidden={tab !== "products"} className="divide-y divide-chrome-border">
              {nav.products.map((g) => (
                <li key={g.href}>
                  <div className="flex items-stretch">
                    <Link href={g.href} className="flex-1 px-4 py-4 font-semibold">
                      {g.label}
                    </Link>
                    {g.children.length > 0 && (
                      <button
                        type="button"
                        aria-expanded={expanded === g.href}
                        onClick={() => setExpanded(expanded === g.href ? null : g.href)}
                        className="tap grid w-14 place-items-center border-l border-chrome-border"
                      >
                        <Icon name="chevronDown" size={20} label={`Show ${g.label} sub-categories`} className="transition-transform [[aria-expanded=true]>&]:rotate-180" />
                      </button>
                    )}
                  </div>
                  {expanded === g.href && (
                    <ul className="bg-chrome-raised pb-2">
                      {g.children.map((c) => (
                        <li key={c.href}>
                          <Link href={c.href} className="block px-6 py-3 text-chrome-fg-muted">
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-px border-t border-chrome-border bg-chrome-border">
            <a href={commerceUrl("/_myacct")} className="flex items-center justify-center gap-2 bg-chrome py-4">
              <Icon name="user" size={18} /> Account
            </a>
            {phone ? (
              <a href={phone.href} className="flex items-center justify-center gap-2 bg-chrome py-4">
                <Icon name="phone" size={18} /> {phone.label}
              </a>
            ) : (
              <Link href="/trade" className="flex items-center justify-center gap-2 bg-chrome py-4">
                Trade
              </Link>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
