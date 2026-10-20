"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/icon";
import type { NavData } from "./nav-data";

type Panel = "jobs" | "products" | null;

/**
 * Two mega-menu disclosures (SPEC §7.1). Disclosure pattern, not ARIA menu:
 * buttons with aria-expanded, panels of ordinary links, Esc closes and returns focus.
 */
export function DesktopNav({ nav }: { nav: NavData }) {
  const [open, setOpen] = useState<Panel>(null);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const id = useId();

  // Close on navigation (render-time reset, not an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(null);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        root.current?.querySelector<HTMLButtonElement>(`[data-panel="${open}"]`)?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const trigger = (panel: Exclude<Panel, null>, label: string) => (
    <button
      type="button"
      data-panel={panel}
      aria-expanded={open === panel}
      aria-controls={`${id}-${panel}`}
      onClick={() => setOpen(open === panel ? null : panel)}
      className="flex h-full items-center gap-1 px-3 font-semibold text-chrome-fg transition-colors hover:text-white aria-expanded:text-white aria-expanded:shadow-[inset_0_-3px_0_var(--oz-color-brand)]"
    >
      {label}
      <Icon name="chevronDown" size={16} className="transition-transform duration-200 [[aria-expanded=true]>&]:rotate-180" />
    </button>
  );

  const group = nav.products[active];

  return (
    <div ref={root} className="hidden h-full items-stretch lg:flex">
      {trigger("jobs", "Shop by job")}
      {trigger("products", "Shop by product")}

      <div
        id={`${id}-jobs`}
        hidden={open !== "jobs"}
        className="absolute inset-x-0 top-full z-40 border-t border-chrome-border bg-chrome text-chrome-fg shadow-lg"
      >
        <div className="container-x grid grid-cols-3 gap-px py-6">
          {nav.jobs.map((j) => (
            <Link key={j.href} href={j.href} className="group rounded-md p-4 hover:bg-chrome-raised">
              <span className="display block text-d2 group-hover:text-white">{j.label}</span>
              {j.description && <span className="mt-1 block text-sm text-chrome-fg-muted">{j.description}</span>}
            </Link>
          ))}
        </div>
      </div>

      <div
        id={`${id}-products`}
        hidden={open !== "products"}
        className="absolute inset-x-0 top-full z-40 border-t border-chrome-border bg-chrome text-chrome-fg shadow-lg"
      >
        <div className="container-x grid grid-cols-[260px_1fr] gap-8 py-6">
          <ul className="border-r border-chrome-border pr-4">
            {nav.products.map((g, i) => (
              <li key={g.href}>
                <Link
                  href={g.href}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  aria-current={i === active ? "true" : undefined}
                  className="flex items-center justify-between rounded-md px-3 py-2 font-semibold hover:bg-chrome-raised aria-[current=true]:bg-chrome-raised aria-[current=true]:text-white"
                >
                  {g.label}
                  {g.children.length > 0 && <Icon name="chevronRight" size={16} />}
                </Link>
              </li>
            ))}
          </ul>
          {group && (
            <div>
              <Link href={group.href} className="display inline-flex items-center gap-2 text-d3 hover:text-white">
                {group.label}
                <Icon name="arrowRight" size={22} />
              </Link>
              {group.children.length > 0 ? (
                <ul className="mt-4 columns-3 gap-6">
                  {group.children.map((c) => (
                    <li key={c.href} className="break-inside-avoid">
                      <Link href={c.href} className="block py-1.5 text-chrome-fg-muted hover:text-white">
                        {c.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-chrome-fg-muted">Browse the full range.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
