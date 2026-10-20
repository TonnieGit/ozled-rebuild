"use client";

import dynamic from "next/dynamic";
import { useCart } from "./cart-provider";

const CartDrawer = dynamic(() => import("./cart-drawer").then((m) => m.CartDrawer), { ssr: false });

/** The drawer's code loads the first time the cart opens, keeping it out of first-load JS. */
export function LazyCartDrawer(props: { paymentMethods?: string[]; freeShippingFrom?: number }) {
  const { open, lastAdded } = useCart();
  return open || lastAdded.length ? <CartDrawer {...props} /> : null;
}
