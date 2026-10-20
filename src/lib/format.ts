const aud = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" });

export function money(n: number): string {
  return aud.format(n);
}

/** "$119.95" → whole dollars and cents for the split price display. */
export function moneyParts(n: number): { dollars: string; cents: string } {
  const [d, c = "00"] = n.toFixed(2).split(".");
  return { dollars: Number(d).toLocaleString("en-AU"), cents: c };
}

export function saving(price: number, rrp?: number): { amount: number; percent: number } | null {
  if (!rrp || rrp <= price) return null;
  return { amount: rrp - price, percent: Math.round(((rrp - price) / rrp) * 100) };
}

export function voltageLabel(v?: { min: number; max: number }): string | null {
  if (!v) return null;
  return v.min === v.max ? `${v.min}V` : `${v.min}–${v.max}V`;
}

export function dateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
}

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
