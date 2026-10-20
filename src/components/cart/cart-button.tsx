"use client";

import { Icon } from "@/components/icon";
import { useCart } from "./cart-provider";

export function CartButton() {
  const { state, setOpen, ready } = useCart();
  const n = state.itemCount;
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="tap relative grid place-items-center rounded-md text-chrome-fg hover:text-white"
      aria-label={`Cart, ${n} ${n === 1 ? "item" : "items"}`}
    >
      <Icon name="cart" size={24} />
      {ready && n > 0 && (
        <span className="absolute top-1 right-0.5 grid min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] leading-5 font-bold text-white tabular-nums">
          {n > 99 ? "99+" : n}
        </span>
      )}
    </button>
  );
}
