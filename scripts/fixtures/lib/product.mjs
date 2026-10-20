// Product page parser for the OzLed2021 theme.
import { attr, decode, oneLine, text, meta, title, livePath, abs, innerAt } from "./html.mjs";
import { parseCards } from "./parse.mjs";

/** Fix the double-encoded UTF-8 ("wonâ€™t") that appears in some live descriptions. */
export function fixMojibake(s = "") {
  const map = {
    "â€™": "’", "â€˜": "‘", "â€œ": "“", "â€\u009d": "”", "â€": "”", "â€“": "–", "â€”": "—",
    "â€¦": "…", "Â°": "°", "â°": "°", "â„ƒ": "°C", "”¢": "•", "â€¢": "•", "ËšC": "°C", "Ëš": "°", "Â ": " ", "Ã—": "×", "Â": "",
  };
  let out = s;
  for (const k of Object.keys(map).sort((a, b) => b.length - a.length)) out = out.split(k).join(map[k]);
  return out;
}

function between(html, startNeedle, endNeedles, from = 0) {
  const s = html.indexOf(startNeedle, from);
  if (s < 0) return null;
  let e = -1;
  for (const n of endNeedles) {
    const i = html.indexOf(n, s + startNeedle.length);
    if (i >= 0 && (e < 0 || i < e)) e = i;
  }
  return { start: s, end: e < 0 ? html.length : e, html: html.slice(s + startNeedle.length, e < 0 ? undefined : e) };
}

export function parseProductPage(raw, url) {
  const html = fixMojibake(raw);
  const out = { url, path: livePath(url) };
  out.title = title(html);
  out.metaDescription = meta(html, "description");
  out.ogDescription = meta(html, "og:description");

  const main = html.indexOf('id="ozled-main-product-div"');
  const body = main >= 0 ? html.slice(main) : html;

  const skuM = body.match(/<h4 class="sku"[^>]*>\s*Part #:\s*([^<\s]+)/);
  out.sku = skuM ? skuM[1].trim() : null;
  const h1 = body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  out.name = h1 ? oneLine(text(h1[1])) : null;

  // Breadcrumb (before main product div)
  const bc = html.match(/<ul class="brc">([\s\S]*?)<\/ul>/);
  out.breadcrumb = bc
    ? [...bc[1].matchAll(/<a href="([^"]+)">([\s\S]*?)<\/a>/g)].map((m) => ({ path: livePath(m[1]), name: oneLine(text(m[2])) }))
    : [];

  // Pricing (first pricing block = desktop)
  const pr = between(body, 'class="ozled-pricing"', ['id="ozled-buying-options-MOB"', "_jstl__buying_options"]);
  const pricing = pr ? pr.html : body;
  const price = pricing.match(/font-size:42px;">\s*\$([\d,]+\.\d\d)/);
  out.price = price ? Number(price[1].replace(/,/g, "")) : null;
  const rrp = pricing.match(/RRP:\s*<strike>\s*\$([\d,]+\.\d\d)/);
  out.rrp = rrp ? Number(rrp[1].replace(/,/g, "")) : null;
  out.stockTexts = [
    ...new Set(
      [...pricing.matchAll(/<span style="color:(red|green|orange|#[0-9a-fA-F]+);font-size:14px;">\s*([\s\S]*?)<\/span>/g)].map((m) =>
        oneLine(text(m[2])),
      ),
    ),
  ];
  out.priceHidden = !price;
  const callForPrice = pricing.match(/(call for price|request a quote|price on application|enquire)/i);
  out.priceNote = callForPrice ? callForPrice[1] : null;

  // Buying options: button labels
  const bo = between(body, 'id="ozled-buying-options-MOB"', ['id="_jstl__shipping_calculator"', "Calculate Shipping"]);
  out.buttons = bo ? [...new Set([...bo.html.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/g)].map((m) => oneLine(text(m[1]))).filter(Boolean))] : [];
  const restrictedTxt = body.match(/restricted[^<]{0,200}/i);
  out.restrictedText = restrictedTxt ? oneLine(restrictedTxt[0]) : null;

  // Variation selector (one _itmspec_listopt block per option group)
  const optRegion = between(body, 'id="_itmspec_sku"', ["</form>"]);
  const master = body.match(/id="_itmspec_sku" value="([^"]+)"/);
  out.masterSku = master ? master[1] : null;
  out.options = [];
  if (optRegion) {
    for (const g of optRegion.html.split('class="_itmspec_listopt"').slice(1)) {
      const labelM = g.match(/<div style="font-weight:300;padding-top:9.5px;">([\s\S]*?)<\/div>/);
      const values = [...g.matchAll(/<option value="(\d+)"[^>]*>([\s\S]*?)<\/option>/g)].map((m) => oneLine(text(m[2])));
      const selected = g.match(/<option value="\d+" selected[^>]*>([\s\S]*?)<\/option>/);
      out.options.push({ label: labelM ? oneLine(text(labelM[1])) : "Option", values, selected: selected ? oneLine(text(selected[1])) : null });
    }
  }
  out.partSku = out.sku;
  if (out.masterSku && out.masterSku !== out.sku) { out.defaultChildSku = out.sku; out.sku = out.masterSku; } else out.defaultChildSku = null;

  // Images: main + alts (same SKU stem as the main image)
  const imgs = [];
  const mainImg = body.match(/<img src="([^"]+)"[^>]*id="main-image"/);
  if (mainImg) imgs.push(mainImg[1]);
  for (const m of body.matchAll(/["'](\/assets\/alt_\d+\/[^"'?]+)(\?[^"']*)?["']/g)) imgs.push(m[1] + (m[2] || ""));
  for (const m of body.matchAll(/["'](\/assets\/full\/[^"'?]+)(\?[^"']*)?["']/g)) imgs.push(m[1] + (m[2] || ""));
  const seen = new Set();
  out.images = [];
  for (const i of imgs) {
    const key = i.split("?")[0];
    if (seen.has(key)) continue;
    seen.add(key);
    out.images.push(abs(i));
  }

  // Downloads + description region
  const dl = between(body, ">Downloads</h3>", ['<div id="ozled-description-div"']);
  out.downloadsHtml = dl ? dl.html : "";
  const descStart = body.indexOf('<div id="ozled-description-div"');
  let desc = "";
  if (descStart >= 0) {
    const s = body.indexOf(">", descStart) + 1;
    const e = body.indexOf("<style>", s);
    desc = body.slice(s, e < 0 ? undefined : e);
  }
  // Short description is the text before the first <br> in the description div
  const brI = desc.search(/<br\s*\/?>/i);
  out.shortDescription = brI >= 0 ? oneLine(text(desc.slice(0, brI))) : "";
  out.descriptionRaw = brI >= 0 ? desc.slice(brI).replace(/^<br\s*\/?>/i, "") : desc;

  // Spec table
  const tbl = body.match(/<table class="table">([\s\S]*?)<\/table>/);
  out.specTable = {};
  if (tbl) for (const m of tbl[1].matchAll(/<td><strong>([\s\S]*?)<\/strong><\/td>\s*<td>([\s\S]*?)<\/td>/g)) out.specTable[oneLine(text(m[1]))] = oneLine(text(m[2]));

  // Documents: any link to a file (pdf/doc/image) in downloads or description
  const docRegion = out.downloadsHtml + out.descriptionRaw;
  out.docLinks = [];
  for (const m of docRegion.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = m[1].trim();
    if (/\.(pdf|docx?|xlsx?)(\?|$)/i.test(href) || /\/assets\/files\//i.test(href)) out.docLinks.push({ url: abs(href.trim()), label: oneLine(text(m[2])) });
  }
  out.descImages = [...out.descriptionRaw.matchAll(/<img\b[^>]*>/gi)].map((m) => ({ src: abs(attr(m[0], "src") || ""), alt: attr(m[0], "alt") || "" }));
  out.youtube = [...new Set([...docRegion.matchAll(/(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/g)].map((m) => m[1]))];
  out.iframeTitles = [...docRegion.matchAll(/<iframe\b[^>]*>/gi)].map((m) => attr(m[0], "title"));

  // Cross-sell ("Goes best with")
  const gb = between(body, "<h2>Goes best with</h2>", ['id="stop-sticky-here-pls"']);
  out.crossSell = gb ? parseCards(gb.html).map((c) => ({ sku: c.sku, name: c.name, path: c.path, price: c.price, brand: c.brand })) : [];
  const gbButtons = gb ? [...gb.html.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/g)].map((m) => oneLine(text(m[1]))) : [];
  out.crossSell.forEach((c, i) => (c.button = gbButtons[i]));
  // gtag brand
  const gb2 = html.match(/item_brand:\s*["'`]([^"'`]+)["'`]/);
  out.gtagBrand = gb2 ? gb2[1] : null;
  return out;
}
