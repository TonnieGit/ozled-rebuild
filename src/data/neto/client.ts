import "server-only";

/**
 * Minimal Neto API client (SPEC §4). POST /do/WS/NetoAPI with action headers.
 * - At most 5 requests in flight (SPEC §4.2).
 * - Retries 429/5xx with exponential backoff.
 * UNTESTED against the live API: no credentials yet (docs/neto-field-map.md).
 */

const MAX_CONCURRENT = 5;
const MAX_RETRIES = 4;

let inFlight = 0;
const waiters: (() => void)[] = [];

async function acquire() {
  if (inFlight < MAX_CONCURRENT) {
    inFlight++;
    return;
  }
  await new Promise<void>((resolve) => waiters.push(resolve));
  inFlight++;
}

function release() {
  inFlight--;
  waiters.shift()?.();
}

export class NetoError extends Error {
  constructor(
    message: string,
    readonly action: string,
    readonly status?: number,
  ) {
    super(`[Neto ${action}] ${message}`);
  }
}

export interface NetoResponse {
  Ack: "Success" | "Warning" | "Error";
  Messages?: unknown;
  [key: string]: unknown;
}

export async function netoCall<T extends NetoResponse>(action: string, body: unknown): Promise<T> {
  const url = process.env.NETO_API_URL;
  const username = process.env.NETO_API_USERNAME;
  const key = process.env.NETO_API_KEY;
  if (!url || !username || !key) throw new NetoError("NETO_API_URL / NETO_API_USERNAME / NETO_API_KEY not set", action);

  await acquire();
  try {
    for (let attempt = 0; ; attempt++) {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          NETOAPI_ACTION: action,
          NETOAPI_USERNAME: username,
          NETOAPI_KEY: key,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      });
      if ((res.status === 429 || res.status >= 500) && attempt < MAX_RETRIES) {
        const retryAfter = Number(res.headers.get("retry-after"));
        const wait = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 500 * 2 ** attempt;
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      if (!res.ok) throw new NetoError(`HTTP ${res.status}`, action, res.status);
      const json = (await res.json()) as T;
      if (json.Ack === "Error") throw new NetoError(JSON.stringify(json.Messages), action);
      return json;
    }
  } finally {
    release();
  }
}

/** Page through a Get* action until a short page comes back. */
export async function netoGetAll<T>(
  action: string,
  listKey: string,
  filter: Record<string, unknown>,
  limit = 250,
): Promise<T[]> {
  const out: T[] = [];
  for (let page = 0; ; page++) {
    const res = await netoCall<NetoResponse>(action, { Filter: { ...filter, Page: page, Limit: limit } });
    const items = (res[listKey] as T[] | undefined) ?? [];
    out.push(...items);
    if (items.length < limit) return out;
  }
}
