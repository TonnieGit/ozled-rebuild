export interface CartLine {
  sku: string;
  name: string;
  qty: number;
  /** Unit price, AUD inc GST. */
  price: number;
  image?: string;
  path?: string;
}

export interface CartState {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
}

/** Two implementations behind one interface (docs/decisions.md #5). */
export interface CartClient {
  read(): Promise<CartState>;
  add(lines: CartLine[]): Promise<CartState>;
  setQty(sku: string, qty: number): Promise<CartState>;
  remove(sku: string): Promise<CartState>;
  /** Where "Checkout" goes: Neto cart/payment, with every line when we hold the bag. */
  checkoutUrl(state: CartState): string;
}

export const EMPTY_CART: CartState = { lines: [], itemCount: 0, subtotal: 0 };

export function summarise(lines: CartLine[]): CartState {
  return {
    lines,
    itemCount: lines.reduce((n, l) => n + l.qty, 0),
    subtotal: Math.round(lines.reduce((n, l) => n + l.qty * l.price, 0) * 100) / 100,
  };
}

/** Neto multi-add URL (SPEC §6.1): /_mycart?multi=n&sku0=..&qty0=..[&fn=payment] */
export function netoMultiUrl(base: string, lines: Pick<CartLine, "sku" | "qty">[], toPayment: boolean): string {
  const p = new URLSearchParams({ multi: String(lines.length) });
  lines.forEach((l, i) => {
    p.set(`sku${i}`, l.sku);
    p.set(`qty${i}`, String(l.qty));
  });
  if (toPayment) p.set("fn", "payment");
  return `${base}/_mycart?${p.toString()}`;
}
