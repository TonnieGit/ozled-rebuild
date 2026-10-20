"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { Icon } from "@/components/icon";
import type { Product, StockStatus } from "@/data/types";
import { cx, money } from "@/lib/format";
import { StockChip } from "./bits";

type BuyProduct = Pick<Product, "sku" | "name" | "price" | "path" | "stock" | "pickupAvailable" | "restricted"> & { image?: string };

/**
 * Quantity + Add to cart, live stock (SPEC §4.2), and the mobile sticky bar that
 * appears once the main button scrolls away (SPEC §7.5). Restricted items get a
 * quote request instead of a cart button (SPEC §7.6).
 */
export function BuyBox({ product, quoteHref, pickupLocality }: { product: BuyProduct; quoteHref: string; pickupLocality?: string }) {
  const { add, busy } = useCart();
  const [qty, setQty] = useState(1);
  const [stock, setStock] = useState<StockStatus>(product.stock);
  const [pickup, setPickup] = useState(product.pickupAvailable);
  const [showSticky, setShowSticky] = useState(false);
  const mainButton = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/stock?sku=${encodeURIComponent(product.sku)}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((s: { stock: StockStatus; pickupAvailable: boolean } | null) => {
        if (s) {
          setStock(s.stock);
          setPickup(s.pickupAvailable);
        }
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [product.sku]);

  useEffect(() => {
    const el = mainButton.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onAdd = () => add([{ sku: product.sku, name: product.name, qty, price: product.price, image: product.image, path: product.path }]);
  const unavailable = stock === "out";

  if (product.restricted) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-signal/60 bg-signal/10 p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold">
            <Icon name="lock" size={18} /> Authorised buyers only
          </p>
          <p className="mt-1 text-fg-muted">
            Red and blue warning lights and sirens are restricted to emergency services and authorised operators. Request a quote and our team will confirm your eligibility.
          </p>
        </div>
        <a href={quoteHref} className="flex h-12 items-center justify-center gap-2 rounded-md bg-action font-semibold text-action-fg hover:bg-action-hover">
          Request a quote
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <StockChip stock={stock} />
          {pickupLocality && (
            <p className={cx("inline-flex items-center gap-1.5 text-sm", pickup ? "text-fg" : "text-fg-subtle")}>
              <Icon name="store" size={16} />
              {pickup ? `Pickup today in ${pickupLocality}` : `Not available for pickup in ${pickupLocality}`}
            </p>
          )}
        </div>
        <div ref={mainButton} className="flex gap-3">
          <div className="flex h-12 items-center rounded-md border border-border-strong">
            <button type="button" className="tap grid h-full place-items-center disabled:opacity-40" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}>
              <Icon name="minus" size={16} label="Decrease quantity" />
            </button>
            <label className="sr-only" htmlFor="qty">
              Quantity
            </label>
            <input
              id="qty"
              inputMode="numeric"
              value={qty}
              onChange={(e) => setQty(Math.max(1, Math.min(999, Number(e.target.value.replace(/\D/g, "")) || 1)))}
              className="w-10 bg-transparent text-center font-semibold tabular-nums focus:outline-none"
            />
            <button type="button" className="tap grid h-full place-items-center" onClick={() => setQty((q) => Math.min(999, q + 1))}>
              <Icon name="plus" size={16} label="Increase quantity" />
            </button>
          </div>
          <button
            type="button"
            onClick={onAdd}
            disabled={busy || unavailable}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-action text-base font-semibold text-action-fg hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="cart" size={20} />
            {unavailable ? "Out of stock" : stock === "backorder" ? "Backorder now" : "Add to cart"}
          </button>
        </div>
      </div>

      <div
        className={cx(
          "fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 p-3 shadow-lg backdrop-blur transition-transform duration-200 md:hidden",
          showSticky ? "translate-y-0" : "translate-y-full",
        )}
        aria-hidden={!showSticky}
        inert={!showSticky}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{product.name}</p>
            <p className="font-bold tabular-nums">{money(product.price)}</p>
          </div>
          <button type="button" onClick={onAdd} disabled={busy || unavailable} className="h-11 rounded-md bg-action px-5 font-semibold text-action-fg disabled:opacity-50">
            Add to cart
          </button>
        </div>
      </div>
    </>
  );
}
