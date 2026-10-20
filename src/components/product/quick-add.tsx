"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";
import type { ProductCard } from "@/data/types";
import { cx } from "@/lib/format";

/** The card's one primary action. Restricted and unavailable items link to the product instead. */
export function QuickAdd({ card, className }: { card: ProductCard; className?: string }) {
  const { add, busy } = useCart();
  const base = "flex h-11 w-full items-center justify-center rounded-md text-sm font-semibold transition-colors";

  if (card.restricted) {
    return (
      <Link href={card.path} className={cx(base, "border border-border-strong text-fg hover:bg-bg-muted", className)}>
        Request a quote
      </Link>
    );
  }
  if (card.stock === "out") {
    return (
      <Link href={card.path} className={cx(base, "border border-border text-fg-muted hover:bg-bg-muted", className)}>
        View options
      </Link>
    );
  }
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => add([{ sku: card.sku, name: card.name, qty: 1, price: card.price, image: card.images[0]?.src, path: card.path }])}
      className={cx(base, "bg-action text-action-fg hover:bg-action-hover disabled:opacity-60", className)}
    >
      {card.stock === "backorder" ? "Backorder" : "Add to cart"}
      <span className="sr-only"> – {card.name}</span>
    </button>
  );
}
