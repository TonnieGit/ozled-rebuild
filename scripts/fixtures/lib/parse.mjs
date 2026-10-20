// Parsers for the OzLed2021 Neto theme markup.
import { attr, decode, oneLine, text, meta, title, livePath, abs } from "./html.mjs";

/** Mobile menu (#menu_*) holds the full live tree, so parse that. */
export function parseMenu(home) {
  const start = home.indexOf('<li class="menu-level1"><a href="https://www.ozled.com.au" title="Home">');
  const end = home.indexOf("Join OzLED Crew", start);
  const chunk = home.slice(start, end);
  // Tokenise into groups (showMM headers, "All X" links, leaf links, and closing </ul>)
  const tokens = [];
  const re = /<li onclick="showMM\('(\d+)'\);">\s*([\s\S]*?)<i |<li onclick="self\.location\.href='([^']+)';"( style="text-transform:uppercase;")?>\s*([\s\S]*?)<\/li>|<\/ul>/g;
  let m;
  while ((m = re.exec(chunk))) {
    if (m[1]) tokens.push({ t: "group", id: m[1], name: oneLine(decode(m[2])) });
    else if (m[3]) tokens.push({ t: m[4] ? "all" : "leaf", href: m[3], name: oneLine(decode(m[5].replace(/<[^>]+>/g, ""))) });
    else tokens.push({ t: "end" });
  }
  // Build tree: group → (all link gives its path) → children until matching end
  const root = { children: [] };
  const stack = [root];
  let pending = null;
  for (const tk of tokens) {
    const top = stack[stack.length - 1];
    if (tk.t === "group") {
      pending = { menuId: tk.id, name: tk.name, path: null, children: [] };
      top.children.push(pending);
      stack.push(pending);
    } else if (tk.t === "all") {
      top.path = livePath(tk.href);
    } else if (tk.t === "leaf") {
      top.children.push({ name: tk.name, path: livePath(tk.href), children: [] });
    } else if (tk.t === "end") {
      if (stack.length > 1) stack.pop();
    }
  }
  return root.children;
}

/** Product cards on a listing page (category, or "Goes best with" block). */
export function parseCards(html) {
  const out = [];
  const re = /<div\s+class="ga4-product"([\s\S]*?)>/g;
  let m;
  while ((m = re.exec(html))) {
    const t = m[0];
    out.push({
      sku: attr(t, "data-id"),
      name: oneLine(attr(t, "data-name") || ""),
      index: Number(attr(t, "data-index")),
      brand: attr(t, "data-brand"),
      price: Number(attr(t, "data-price")),
      url: attr(t, "data-url"),
      path: attr(t, "data-url") ? livePath(attr(t, "data-url")) : null,
      at: m.index,
    });
  }
  return out;
}

export function parseCategoryPage(html) {
  const h1m = html.match(/<h1 class="page-header" style="font-size:38px;color:#000;[^"]*">([\s\S]*?)<\/h1>/);
  const descStart = html.indexOf('<div id="main-category-div" class="container-fluid homepage full-width" style="margin-top:50px;"');
  let desc = "";
  if (descStart >= 0) {
    const s = html.indexOf(">", html.indexOf("<br><br>", descStart)) + 1;
    let e = html.indexOf("<!-- Service Structured Data Starts -->", s);
    if (e < 0) e = html.indexOf('<h2 style="font-weight:bold;">DIDN', s);
    desc = html.slice(s, e);
  }
  const cards = parseCards(html.slice(0, descStart > 0 ? descStart : html.length));
  const pages = [...html.matchAll(/pgnum=(\d+)/g)].map((x) => Number(x[1]));
  return {
    title: title(html),
    metaDescription: meta(html, "description"),
    h1: h1m ? oneLine(text(h1m[1])) : null,
    descriptionHtml: desc.trim(),
    cards,
    pageCount: pages.length ? Math.max(...pages) : 1,
  };
}

export { abs };
