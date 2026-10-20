import { encodeNsd, parseNetoAjax, type NsdValue } from "./nsd";
import { summarise, type CartClient, type CartLine, type CartState } from "./types";

/**
 * Live Neto cart over same-origin /ajax/addtocart (routing Option A,
 * docs/routing-spike.md). Requires the storefront and Neto on one origin so the
 * session cookie is shared. CSRF: Neto returns a fresh token in every response,
 * including the FAIL for a missing/expired one, so we retry once with it.
 */
let csrf = "";

async function call(params: Record<string, string>): Promise<Record<string, NsdValue>> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const body = new URLSearchParams({ ...params, ...(csrf ? { csrf_token: csrf } : {}) });
    const res = await fetch("/ajax/addtocart", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
      body,
    });
    const { status, data } = parseNetoAjax(await res.text());
    if (typeof data.csrf_token === "string") csrf = data.csrf_token;
    if (status === "SUCCESS") return data;
    if (attempt === 0 && typeof data.csrf_token === "string") continue;
    throw new Error(`Neto cart ${params.proc} failed: ${typeof data.msg === "string" ? data.msg : status}`);
  }
  throw new Error("unreachable");
}

function toState(data: Record<string, NsdValue>): CartState {
  const items = Array.isArray(data.cartitems) ? data.cartitems : [];
  const lines: CartLine[] = items.flatMap((raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
    const r = raw as Record<string, NsdValue>;
    return [
      {
        sku: String(r.sku ?? ""),
        name: String(r.name ?? r.sku ?? ""),
        qty: Number(r.qty ?? 0),
        price: Number(r.price ?? 0),
        image: typeof r.image === "string" && r.image ? r.image : undefined,
        path: typeof r.url === "string" ? new URL(r.url, location.origin).pathname : undefined,
      },
    ];
  });
  return summarise(lines);
}

export function createNetoAjaxCart(): CartClient {
  return {
    async read() {
      return toState(await call({ proc: "ShowItem" }));
    },
    async add(lines) {
      if (lines.length === 1) {
        await call({ proc: "AddItem", sku: lines[0].sku, qty: String(lines[0].qty) });
      } else {
        const items = Object.fromEntries(lines.map((l) => [l.sku, String(l.qty)]));
        await call({ proc: "AddMultiItems", items: encodeNsd(items) });
      }
      return this.read();
    },
    async setQty(sku, qty) {
      if (qty <= 0) return this.remove(sku);
      const state = await this.read();
      const line = state.lines.find((l) => l.sku === sku);
      if (!line) return state;
      // Neto has no "set" proc: remove and re-add at the new quantity.
      await call({ proc: "RemoveItem", sku });
      await call({ proc: "AddItem", sku, qty: String(qty) });
      return this.read();
    },
    async remove(sku) {
      await call({ proc: "RemoveItem", sku });
      return this.read();
    },
    checkoutUrl() {
      return "/_mycart?fn=payment";
    },
  };
}
