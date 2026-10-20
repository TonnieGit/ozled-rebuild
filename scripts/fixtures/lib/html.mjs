// Minimal HTML helpers (no dependencies). Good enough for Neto's templated markup.

const NAMED = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—",
  rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", deg: "°", times: "×", hellip: "…",
  reg: "®", trade: "™", copy: "©", frac12: "½", frac14: "¼", plusmn: "±", micro: "µ",
  bull: "•", middot: "·", eacute: "é", sup2: "²", Oslash: "Ø", oslash: "ø", rarr: "→",
};

export function decode(s = "") {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-zA-Z0-9]+);/g, (m, n) => (n in NAMED ? NAMED[n] : m));
}

export function escapeHtml(s = "") {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Strip all tags → plain text, whitespace collapsed. */
export function text(html = "") {
  return decode(
    html
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|li|h[1-6]|div|tr)>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t ]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

export function oneLine(s = "") {
  return s.replace(/\s+/g, " ").trim();
}

export function attr(tag, name) {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return m ? decode(m[2] ?? m[3] ?? m[4] ?? "") : undefined;
}

export function meta(html, key) {
  const re = new RegExp(`<meta[^>]+(?:name|property)=["']${key}["'][^>]*>`, "i");
  const m = html.match(re);
  return m ? attr(m[0], "content") : undefined;
}

export function title(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return m ? oneLine(decode(m[1])) : undefined;
}

/**
 * Return the inner HTML of the element starting at index `start` (index of its "<tag").
 * Balanced on the same tag name.
 */
export function innerAt(html, start) {
  const open = html.slice(start).match(/^<([a-zA-Z0-9]+)[^>]*>/);
  if (!open) return null;
  const tag = open[1].toLowerCase();
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, "gi");
  re.lastIndex = start;
  let depth = 0;
  let m;
  let bodyStart = start + open[0].length;
  while ((m = re.exec(html))) {
    if (m[0].endsWith("/>")) continue;
    if (m[1] === "/") {
      depth--;
      if (depth === 0) return html.slice(bodyStart, m.index);
    } else depth++;
  }
  return html.slice(bodyStart);
}

export function findById(html, id) {
  const i = html.search(new RegExp(`<[a-zA-Z0-9]+[^>]*\\sid=["']${id}["']`, "i"));
  return i < 0 ? null : innerAt(html, i);
}

const KEEP = new Set(["p", "ul", "ol", "li", "h2", "h3", "h4", "strong", "em", "a", "table", "thead", "tbody", "tr", "th", "td", "br"]);
const MAP = { b: "strong", i: "em", h1: "h2", h5: "h4", h6: "h4" };

/**
 * Sanitise to the allowed tag set. Drops styles, scripts, iframes, fonts, images and empty tags.
 * Links are made relative when they point at www.ozled.com.au.
 */
export function sanitize(html = "") {
  let s = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|noscript|iframe|object|embed|svg|form|button|select|textarea)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<(img|iframe|input|meta|link|hr)\b[^>]*>/gi, "");
  s = s.replace(/<(\/?)([a-zA-Z0-9]+)([^>]*)>/g, (m, close, tag, rest) => {
    let t = tag.toLowerCase();
    t = MAP[t] || t;
    if (!KEEP.has(t)) return close ? " " : " ";
    if (close) return `</${t}>`;
    if (t === "br") return "<br>";
    if (t === "a") {
      let href = attr(m, "href") || "";
      href = href.trim().replace(/^https?:\/\/(www\.)?ozled\.com\.au(?=\/|$)/i, "") || "/";
      if (/^javascript:/i.test(href)) href = "#";
      const ext = /^https?:/i.test(href);
      return `<a href="${escapeHtml(href)}"${ext ? ' rel="noopener"' : ""}>`;
    }
    if (t === "td" || t === "th") {
      const cs = attr(m, "colspan");
      return cs ? `<${t} colspan="${escapeHtml(cs)}">` : `<${t}>`;
    }
    return `<${t}>`;
  });
  s = decode(s)
    .replace(/&(?![a-zA-Z]+;|#\d+;)/g, "&amp;")
    .replace(/[ \t ]+/g, " ")
    .replace(/\s*\n\s*/g, "\n");
  // Remove empty elements repeatedly
  for (let i = 0; i < 6; i++) {
    s = s.replace(/<(p|li|h2|h3|h4|strong|em|ul|ol|a|td|th|tr|tbody|thead|table)\b[^>]*>(\s|<br>)*<\/\1>/gi, "");
  }
  // Collapse nested duplicate strong/em
  s = s.replace(/<strong>\s*<strong>/g, "<strong>").replace(/<\/strong>\s*<\/strong>/g, "</strong>");
  s = s.replace(/(<br>\s*){2,}/g, "<br>").replace(/<(p|li|h2|h3|h4)>\s*<br>/g, "<$1>").replace(/<br>\s*<\/(p|li|h2|h3|h4)>/g, "</$1>");
  s = s.replace(/>\s+</g, (m) => (m.includes("\n") ? ">\n<" : "> <"));
  s = s
    .replace(/<\/strong>\s*<strong>/g, (m) => (/\s/.test(m) ? " " : ""))
    .replace(/<(p|li|h2|h3|h4|td|th)>\s+/g, "<$1>")
    .replace(/\s+<\/(p|li|h2|h3|h4|td|th)>/g, "</$1>");
  return s.trim();
}

export function abs(u, base = "https://www.ozled.com.au/") {
  try {
    return new URL(decode(u), base).href;
  } catch {
    return u;
  }
}

/** Exact live path from a link: strip the origin, keep case, slash and query-less path. */
export function livePath(u) {
  const x = new URL(decode(u), "https://www.ozled.com.au/");
  return decodeURI(x.pathname);
}
