/**
 * Neto "NSD1" serialisation, used by the storefront AJAX endpoints (/ajax/*).
 * Reverse-engineered from Neto's webstore main.js (create_netosd_data / parse_netosd_data):
 *   string: $<len>|<escaped chars>   (len counts escaped chars; JS escape())
 *   object: #<n>|(<key><value>)×n    (keys are strings)
 *   array:  @<n>|<value>×n
 * Responses are wrapped as ^NETO^<STATUS>^NSD1;...
 */

export type NsdValue = string | NsdValue[] | { [key: string]: NsdValue };

function jsEscape(s: string): string {
  // Equivalent of the deprecated global escape(), which Neto's server expects.
  return s.replace(/[^A-Za-z0-9@*_+\-./]/g, (ch) => {
    const code = ch.charCodeAt(0);
    return code < 256 ? `%${code.toString(16).toUpperCase().padStart(2, "0")}` : `%u${code.toString(16).toUpperCase().padStart(4, "0")}`;
  });
}

function jsUnescape(s: string): string {
  return s.replace(/%u([0-9a-fA-F]{4})|%([0-9a-fA-F]{2})/g, (_m, u: string | undefined, b: string | undefined) =>
    String.fromCharCode(parseInt((u ?? b)!, 16)),
  );
}

export function encodeNsd(value: unknown): string {
  return `NSD1;${encodeRc(value)}`;
}

function encodeRc(v: unknown): string {
  if (Array.isArray(v)) return `@${v.length}|${v.map(encodeRc).join("")}`;
  if (v !== null && typeof v === "object") {
    const entries = Object.entries(v);
    return `#${entries.length}|${entries.map(([k, val]) => encodeRc(k) + encodeRc(val)).join("")}`;
  }
  const e = jsEscape(String(v ?? ""));
  return `$${e.length}|${e}`;
}

export function decodeNsd(input: string): NsdValue | null {
  if (!input.startsWith("NSD1;")) return null;
  const [value] = decodeRc(input, 5);
  return value;
}

function readCount(s: string, i: number): [number, number] {
  const bar = s.indexOf("|", i);
  if (bar < 0) throw new Error(`NSD: missing length delimiter at ${i}`);
  return [Number(s.slice(i, bar)), bar + 1];
}

function decodeRc(s: string, i: number): [NsdValue, number] {
  const kind = s[i];
  const [n, start] = readCount(s, i + 1);
  if (kind === "$") return [jsUnescape(s.slice(start, start + n)), start + n];
  if (kind === "@") {
    const arr: NsdValue[] = [];
    let at = start;
    for (let k = 0; k < n; k++) {
      const [v, next] = decodeRc(s, at);
      arr.push(v);
      at = next;
    }
    return [arr, at];
  }
  if (kind === "#" || kind === "&") {
    const obj: Record<string, NsdValue> = {};
    let at = start;
    for (let k = 0; k < n; k++) {
      const [key, afterKey] = decodeRc(s, at);
      const [v, next] = decodeRc(s, afterKey);
      obj[String(key)] = v;
      at = next;
    }
    return [obj, at];
  }
  throw new Error(`NSD: unknown type "${kind}" at ${i}`);
}

/** Split "^NETO^SUCCESS^NSD1;..." into status + decoded payload. */
export function parseNetoAjax(text: string): { status: string; data: Record<string, NsdValue> } {
  const marker = "^NETO^";
  const at = text.indexOf(marker);
  if (at < 0) return { status: "ERROR", data: {} };
  const rest = text.slice(at + marker.length);
  const caret = rest.indexOf("^");
  const status = rest.slice(0, caret).toUpperCase();
  const decoded = decodeNsd(rest.slice(caret + 1));
  return { status, data: decoded && typeof decoded === "object" && !Array.isArray(decoded) ? decoded : {} };
}
