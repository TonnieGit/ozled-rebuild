import { netoMultiUrl, summarise, type CartClient, type CartLine, type CartState } from "./types";

const KEY = "ozled.bag.v1";

function load(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as CartLine[]).filter((l) => l && typeof l.sku === "string" && l.qty > 0) : [];
  } catch {
    return [];
  }
}

function save(lines: CartLine[]): CartState {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    // Private mode / blocked storage: the bag still works for this page view.
  }
  return summarise(lines);
}

let memory: CartLine[] | null = null;
const current = () => (memory ??= load());

/**
 * Storefront-held bag (SPEC §6.2). Used in fixtures mode and for the subdomain
 * fallback; checkout hands every line to Neto in one multi= URL.
 */
export function createLocalBag(commerceOrigin: string): CartClient {
  return {
    async read() {
      return summarise(current());
    },
    async add(lines) {
      const next = [...current()];
      for (const line of lines) {
        const existing = next.find((l) => l.sku === line.sku);
        if (existing) existing.qty += line.qty;
        else next.push({ ...line });
      }
      memory = next;
      return save(next);
    },
    async setQty(sku, qty) {
      memory = current()
        .map((l) => (l.sku === sku ? { ...l, qty } : l))
        .filter((l) => l.qty > 0);
      return save(memory);
    },
    async remove(sku) {
      memory = current().filter((l) => l.sku !== sku);
      return save(memory);
    },
    checkoutUrl(state) {
      return netoMultiUrl(commerceOrigin, state.lines, true);
    },
  };
}
