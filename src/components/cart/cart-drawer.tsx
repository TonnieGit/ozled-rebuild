"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Icon } from "@/components/icon";
import { money } from "@/lib/format";
import { useCart } from "./cart-provider";

const FREE_SHIPPING_FROM = 99;

/** Slide-over cart (SPEC §6.1). Native <dialog> gives focus trapping and Esc for free. */
export function CartDrawer() {
  const { state, open, setOpen, setQty, remove, busy, error, checkoutUrl, lastAdded } = useCart();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const toFree = Math.max(0, FREE_SHIPPING_FROM - state.subtotal);

  return (
    <dialog
      ref={ref}
      aria-labelledby="cart-title"
      onClose={() => setOpen(false)}
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
      className="cart-drawer fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-md bg-surface p-0 text-fg shadow-lg backdrop:bg-black/50"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id="cart-title" className="display text-d2">
            Your cart{" "}
            <span className="font-sans text-base font-medium not-italic normal-case text-fg-muted">
              ({state.itemCount} {state.itemCount === 1 ? "item" : "items"})
            </span>
          </h2>
          <button type="button" onClick={() => setOpen(false)} className="tap -mr-2 grid place-items-center rounded-md hover:bg-bg-muted">
            <Icon name="close" label="Close cart" />
          </button>
        </header>

        {lastAdded.length > 0 && (
          <p role="status" className="flex items-center gap-2 bg-bg-subtle px-5 py-3 text-sm font-medium text-success">
            <Icon name="check" size={18} />
            {lastAdded.length === 1 ? `Added ${lastAdded[0].name}` : `Added ${lastAdded.length} items to your cart`}
          </p>
        )}

        <div className="px-5 pt-4">
          <p className="text-sm text-fg-muted">
            {toFree > 0 ? (
              <>
                Spend <strong className="text-fg">{money(toFree)}</strong> more for free shipping.
              </>
            ) : (
              <strong className="text-success">You’ve unlocked free shipping.</strong>
            )}
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-muted" aria-hidden>
            <div className="h-full bg-action transition-[width] duration-300" style={{ width: `${Math.min(100, (state.subtotal / FREE_SHIPPING_FROM) * 100)}%` }} />
          </div>
        </div>

        <ul className="flex-1 divide-y divide-border overflow-y-auto px-5" aria-busy={busy}>
          {state.lines.length === 0 && <li className="py-10 text-center text-fg-muted">Your cart is empty.</li>}
          {state.lines.map((line) => (
            <li key={line.sku} className="flex gap-4 py-4">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-bg-subtle">
                {line.image && <Image src={line.image} alt="" fill sizes="80px" className="object-contain p-1" />}
              </div>
              <div className="min-w-0 flex-1">
                {line.path ? (
                  <Link href={line.path} onClick={() => setOpen(false)} className="line-clamp-2 font-medium hover:underline">
                    {line.name}
                  </Link>
                ) : (
                  <p className="line-clamp-2 font-medium">{line.name}</p>
                )}
                <p className="sku mt-0.5 text-fg-subtle">{line.sku}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center rounded-md border border-border">
                    <button type="button" className="tap grid place-items-center disabled:opacity-40" disabled={busy} onClick={() => setQty(line.sku, line.qty - 1)}>
                      <Icon name="minus" size={16} label={`Decrease quantity of ${line.name}`} />
                    </button>
                    <span className="w-8 text-center tabular-nums" aria-label="Quantity">
                      {line.qty}
                    </span>
                    <button type="button" className="tap grid place-items-center disabled:opacity-40" disabled={busy} onClick={() => setQty(line.sku, line.qty + 1)}>
                      <Icon name="plus" size={16} label={`Increase quantity of ${line.name}`} />
                    </button>
                  </div>
                  <p className="font-semibold tabular-nums">{money(line.price * line.qty)}</p>
                </div>
                <button type="button" onClick={() => remove(line.sku)} className="mt-1 text-sm text-fg-muted underline-offset-2 hover:underline">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        <footer className="border-t border-border px-5 py-4">
          {error && (
            <p role="alert" className="mb-3 text-sm text-error">
              {error}
            </p>
          )}
          <div className="flex items-baseline justify-between">
            <span className="font-medium">Subtotal</span>
            <span className="text-xl font-bold tabular-nums">{money(state.subtotal)}</span>
          </div>
          <p className="mt-1 text-sm text-fg-muted">Shipping, trade and member pricing calculated at checkout.</p>
          <a
            href={state.lines.length ? checkoutUrl : undefined}
            aria-disabled={!state.lines.length}
            className="mt-4 flex h-12 items-center justify-center gap-2 rounded-md bg-action font-semibold text-action-fg hover:bg-action-hover aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            <Icon name="lock" size={18} />
            Secure checkout
          </a>
          <p className="mt-3 text-center text-xs text-fg-subtle">Card · PayPal · Afterpay · Zip</p>
        </footer>
      </div>
    </dialog>
  );
}
