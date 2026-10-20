"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createLocalBag } from "@/lib/cart/local-bag";
import { createNetoAjaxCart } from "@/lib/cart/neto-ajax";
import { EMPTY_CART, type CartClient, type CartLine, type CartState } from "@/lib/cart/types";

interface CartContextValue {
  state: CartState;
  ready: boolean;
  busy: boolean;
  error: string | null;
  open: boolean;
  lastAdded: CartLine[];
  setOpen: (open: boolean) => void;
  add: (lines: CartLine[]) => Promise<void>;
  setQty: (sku: string, qty: number) => Promise<void>;
  remove: (sku: string) => Promise<void>;
  checkoutUrl: string;
}

const CartContext = createContext<CartContextValue | null>(null);

function createClient(): CartClient {
  const commerceOrigin = process.env.NEXT_PUBLIC_COMMERCE_ORIGIN ?? "https://www.ozled.com.au";
  return process.env.NEXT_PUBLIC_CART_MODE === "neto" ? createNetoAjaxCart() : createLocalBag(commerceOrigin);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const client = useRef<CartClient | null>(null);
  const [state, setState] = useState<CartState>(EMPTY_CART);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<CartLine[]>([]);

  useEffect(() => {
    client.current = createClient();
    client.current
      .read()
      .then(setState)
      .catch(() => setState(EMPTY_CART))
      .finally(() => setReady(true));
  }, []);

  const run = useCallback(async (fn: (c: CartClient) => Promise<CartState>) => {
    if (!client.current) return;
    setBusy(true);
    setError(null);
    try {
      setState(await fn(client.current));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong updating your cart.");
    } finally {
      setBusy(false);
    }
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      state,
      ready,
      busy,
      error,
      open,
      lastAdded,
      setOpen,
      add: async (lines) => {
        await run((c) => c.add(lines));
        setLastAdded(lines);
        setOpen(true);
      },
      setQty: (sku, qty) => run((c) => c.setQty(sku, qty)),
      remove: (sku) => run((c) => c.remove(sku)),
      checkoutUrl: client.current?.checkoutUrl(state) ?? "/_mycart",
    }),
    [state, ready, busy, error, open, lastAdded, run],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
