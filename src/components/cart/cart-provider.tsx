"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createLocalBag } from "@/lib/cart/local-bag";
import { createNetoAjaxCart } from "@/lib/cart/neto-ajax";
import { EMPTY_CART, netoMultiUrl, type CartClient, type CartLine, type CartState } from "@/lib/cart/types";

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

const COMMERCE_ORIGIN = process.env.NEXT_PUBLIC_COMMERCE_ORIGIN ?? "https://www.ozled.com.au";
const NETO_MODE = process.env.NEXT_PUBLIC_CART_MODE === "neto";

function createClient(): CartClient {
  return NETO_MODE ? createNetoAjaxCart() : createLocalBag(COMMERCE_ORIGIN);
}

/** Same result as client.checkoutUrl(), computed without touching the client ref during render. */
function checkoutUrlFor(state: CartState): string {
  return NETO_MODE ? "/_mycart?fn=payment" : netoMultiUrl(COMMERCE_ORIGIN, state.lines, true);
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
      checkoutUrl: checkoutUrlFor(state),
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
