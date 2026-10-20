// Step 6: build hubs, kits, banners, posts, content pages, site facts and redirects.
// Images are downloaded (cached) and converted to WebP under public/images/{hubs,kits,banners,posts}.
import fs from "node:fs";
import path from "node:path";
import { getText, ROOT, stats } from "./lib/fetch.mjs";
import { sanitize, innerAt, text, attr, abs, decode } from "./lib/html.mjs";
import { fixMojibake } from "./lib/product.mjs";
import { toWebp } from "./lib/images.mjs";
import { HUBS, KITS } from "./data/hubs-kits.mjs";

const TODAY = "2026-10-20";
const OUT = path.join(ROOT, "src/data/fixtures");
const ORIGIN = "https://www.ozled.com.au";
const problems = [];
const warn = (m) => problems.push(m);
const words = (s) => s.trim().split(/\s+/).length;
const img = (r, alt, view) => ({ src: r.src, alt, width: r.width, height: r.height, ...(view ? { view } : {}) });
const checkSeo = (id, seo) => {
  if (seo.title.length > 60) warn(`${id}: seo title ${seo.title.length}`);
  if (seo.description.length < 140 || seo.description.length > 160) warn(`${id}: seo description ${seo.description.length}`);
};

// ───────────────────────── Hubs & kits ─────────────────────────
const hubs = [];
for (const h of HUBS) {
  const hero = await toWebp(h.hero.url, `images/hubs/${h.hero.file}`, { maxW: 1600, maxH: 1200, quality: 78 });
  if (words(h.summary) < 40 || words(h.summary) > 60) warn(`hub ${h.path}: summary ${words(h.summary)} words`);
  checkSeo(h.path, h.seo);
  const { hero: _h, ...rest } = h;
  hubs.push({ ...rest, heroImage: img(hero, h.hero.alt, h.hero.view) });
}
const kits = [];
for (const k of KITS) {
  const hero = await toWebp(k.hero.url, `images/kits/${k.hero.file}`, { maxW: 1600, maxH: 1200, quality: 78 });
  checkSeo(k.path, k.seo);
  const { hero: _h, ...rest } = k;
  kits.push({ ...rest, heroImage: img(hero, k.hero.alt, k.hero.view) });
}

// ───────────────────────── Banners ─────────────────────────
// The live slider artwork has text baked in (a BASE6 competition, a new-arrival promo and a
// "62% off" clearance), so the heroes use the homepage's clean photography instead.
const BANNERS = [
  {
    id: "hero-tail-lights",
    slot: "home-hero",
    headline: "LED tail lights for trays, trucks and trailers",
    subhead: "Combination, plug-and-play and trailer lamps from LED Autolamps, Narva and Roadvision, plus the plates, plugs and brackets to fit them.",
    ctaLabel: "Build your tray lighting",
    ctaUrl: "/ute-tray-lights/",
    desktop: { url: `${ORIGIN}/assets/images/385%20wide%20banner%20bg.jpg`, file: "tail-lights-desktop.webp" },
    mobile: { url: `${ORIGIN}/assets/images/385%20wide%20sml%20bg.jpg`, file: "tail-lights-mobile.webp" },
    alt: "Close-up of an LED Autolamps 385 Series tail light on a dark background",
  },
  {
    id: "hero-off-road",
    slot: "home-hero",
    headline: "Light bars, driving lights and work lights",
    subhead: "Off-road LED lighting for 4WDs and work utes, including BASE6, OzLED's own brand since 2013.",
    ctaLabel: "Shop off-road lighting",
    ctaUrl: "/off-road-led-lights/",
    desktop: { url: `${ORIGIN}/assets/images/ORV%20wide%20banner%20for%20home%20page(1).jpg`, file: "off-road-desktop.webp" },
    mobile: { url: `${ORIGIN}/assets/images/ORV%20wide%20banner%20for%20home%20page(1).jpg`, file: "off-road-mobile.webp", crop: { left: 40, width: 900 } },
    alt: "Red Ford Raptor driving on a dirt track with an LED light bar fitted to the front bar",
  },
  {
    id: "hero-showroom",
    slot: "home-hero",
    headline: "Order online or pick up in Brendale",
    subhead: "Visit the OzLED showroom at U1/218 Leitchs Road, Brendale QLD, or call (07) 3205 4355 for advice.",
    ctaLabel: "Contact the team",
    ctaUrl: "/form/contact-us/",
    desktop: { url: `${ORIGIN}/assets/images/Mustrang%20infront%20of%20OzLED.jpg`, file: "showroom-desktop.webp" },
    mobile: { url: `${ORIGIN}/assets/images/Mustrang%20infront%20of%20OzLED.jpg`, file: "showroom-mobile.webp", crop: { left: 250, width: 1200 } },
    alt: "Classic Ford Mustang parked outside the OzLED showroom in Brendale",
  },
];
const banners = [];
let order = 1;
for (const b of BANNERS) {
  const d = await toWebp(b.desktop.url, `images/banners/${b.desktop.file}`, { maxW: 1920, maxH: 1920, quality: 75 });
  const mobOpts = { maxW: 800, maxH: 800, quality: 75 };
  let m;
  if (b.mobile.crop) {
    // crop a region of the source image, then resize
    const sharp = (await import("sharp")).default;
    const { getBinary } = await import("./lib/fetch.mjs");
    const buf = await getBinary(b.mobile.url);
    const meta = await sharp(buf).metadata();
    const out = path.join(ROOT, "public/images/banners", b.mobile.file);
    const info = await sharp(buf)
      .extract({ left: b.mobile.crop.left, top: 0, width: Math.min(b.mobile.crop.width, meta.width - b.mobile.crop.left), height: meta.height })
      .resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(out);
    m = { src: `/images/banners/${b.mobile.file}`, width: info.width, height: info.height };
  } else m = await toWebp(b.mobile.url, `images/banners/${b.mobile.file}`, mobOpts);
  banners.push({
    id: b.id,
    slot: b.slot,
    headline: b.headline,
    subhead: b.subhead,
    ctaLabel: b.ctaLabel,
    ctaUrl: b.ctaUrl,
    image: { desktop: img(d, b.alt), mobile: img(m, b.alt) },
    sortOrder: order++,
  });
}
banners.push({
  id: "notice-shipping-pickup",
  slot: "site-notice",
  headline: "Free shipping on orders over $99* · Pickup from our Brendale showroom",
  subhead: "*Retail and member orders to Australian addresses. Excludes some items and select suburbs due to high shipping costs.",
  ctaLabel: "Free shipping conditions",
  ctaUrl: "/Free-Shipping-Conditions",
  sortOrder: 1,
});

// ───────────────────────── Blog posts ─────────────────────────
const POSTS = [
  {
    path: "/blog/our-blog/before-you-buy-led-tail-lights/",
    title: "Before You Buy LED Tail Lights",
    tags: ["tail-lights", "adr", "buying-guide"],
    excerpt: "What to check before buying aftermarket LED tail lights: ADR approval, compatibility with your vehicle, build quality, style and warranty.",
    hero: { url: `${ORIGIN}/assets/images/385%20wide%20sml%20bg.jpg`, alt: "Close-up of an LED Autolamps 385 Series tail light" },
    seo: { title: "Before You Buy LED Tail Lights | OzLED", description: "A buyer's checklist for aftermarket LED tail lights: why ADR approval matters, plus compatibility, quality, style and warranty. From the OzLED team in Brendale." },
    images: {},
  },
  {
    path: "/blog/our-blog/led-load-resistors/",
    title: "LED Load Resistors: Why You Need Them",
    tags: ["load-resistors", "tail-lights", "wiring"],
    excerpt: "Why some vehicles flash fast or show errors after an LED upgrade, how load resistors fix it, and how to wire and mount them safely.",
    hero: { url: `${ORIGIN}/assets/images/lr12%20install%202.png`, alt: "BASE6 12V load resistor being connected into a vehicle wiring loom" },
    seo: { title: "LED Load Resistors: Why You Need Them | OzLED", description: "Why LED upgrades can cause fast flashing or dash errors, how load resistors fix it, and how to wire and mount them: always on metal, never to the chassis." },
    images: {
      "https://www.ozled.com.au/assets/images/Capture2%202.PNG": "BASE6 12V and 24V load resistors with a dimension drawing (50 x 28mm)",
      "https://www.ozled.com.au/assets/images/lr12%20install%202.png": "BASE6 12V load resistor being connected into a vehicle wiring loom",
      "https://www.ozled.com.au/assets/images/Load%20resistor%20install.png": "Wiring diagram: load resistor connected between the lamp's power and earth wires",
    },
  },
  {
    path: "/blog/our-blog/screw-in-or-bolt-on-rear-combination-lamps/",
    title: "Screw In or Bolt On Rear Combination Lamps",
    tags: ["tail-lights", "led-autolamps", "product-news"],
    excerpt: "The LED Autolamps 283 Series rear combination lamps can be screwed on or bolted from behind, with a 25mm low profile, IP67 rating and 5-year warranty.",
    hero: { url: `${ORIGIN}/assets/images/46(1).jpg`, alt: "LED Autolamps 283 Series rear combination lamps with removable mounting bracket and fittings" },
    seo: { title: "Screw In or Bolt On Rear Combination Lamps | OzLED", description: "LED Autolamps 283 Series rear combination lamps: screw-on or bolt-on mounting, 283 x 100 x 25mm, 48 SMD LEDs, IP67, 12–24V or 12V, 5-year warranty." },
    images: { "https://www.ozled.com.au/assets/images/46(1).jpg": "LED Autolamps 283 Series rear combination lamps with removable mounting bracket and fittings" },
    dropFirstImage: true,
  },
];

const MONTHS = { January: 1, February: 2, March: 3, April: 4, May: 5, June: 6, July: 7, August: 8, September: 9, October: 10, November: 11, December: 12 };
const posts = [];
for (const p of POSTS) {
  const html = fixMojibake((await getText(p.path)).body);
  const byline = html.match(/<!--<p class="text-muted">\s*Author:\s*([^&<]+?)\s*&nbsp;\s*Date Posted:\s*(\d{1,2}) (\w+) (\d{4})/);
  const author = byline ? byline[1].trim() : null;
  const publishedAt = byline ? `${byline[4]}-${String(MONTHS[byline[3]]).padStart(2, "0")}-${byline[2].padStart(2, "0")}` : TODAY;
  const start = html.indexOf('<div class="responsive-content"');
  let body = innerAt(html, start);
  // Swap images for tokens so the sanitiser keeps their position, then convert them.
  const slug = p.path.split("/").filter(Boolean).pop();
  const imgTags = [];
  body = body.replace(/<img\b[^>]*>/gi, (t) => {
    imgTags.push(abs(attr(t, "src") || ""));
    return ` @@IMG${imgTags.length - 1}@@ `;
  });
  body = sanitize(body)
    .replace(/<p>\s*<\/p>/g, "")
    .replace(/<(strong|em)>\s*<\/\1>/g, "");
  for (let i = 0; i < imgTags.length; i++) {
    const u = imgTags[i];
    const alt = p.images[u];
    let rep = "";
    if (alt && !(p.dropFirstImage && i === 0)) {
      const r = await toWebp(u, `images/posts/${slug}/${i + 1}.webp`, { maxW: 1200, maxH: 1200, quality: 80 });
      if (r) rep = `<img src="${r.src}" alt="${alt}" width="${r.width}" height="${r.height}" loading="lazy">`;
    }
    body = body.replace(`@@IMG${i}@@`, rep);
  }
  body = body
    .replace(/<p>\s*<\/p>/g, "")
    .replace(/<p>\s*(<img[^>]+>)\s*<\/p>/g, "<figure>$1</figure>")
    .replace(/\n{2,}/g, "\n")
    .trim();
  const hero = await toWebp(p.hero.url, `images/posts/${slug}/hero.webp`, { maxW: 1600, maxH: 1200, quality: 78 });
  checkSeo(p.path, p.seo);
  posts.push({
    path: p.path,
    title: p.title,
    excerpt: p.excerpt,
    image: img(hero, p.hero.alt),
    author: author ? { name: author, role: author === "LED Autolamps" ? "Manufacturer (guest post)" : "OzLED team" } : { name: "OzLED Team", role: "Product specialists" },
    publishedAt,
    reviewedAt: TODAY,
    tags: p.tags,
    bodyHtml: body,
    seo: p.seo,
  });
}

// ───────────────────────── Content pages ─────────────────────────
const CONTACT_BODY = `<p>Call the OzLED team on <a href="tel:0732054355">(07) 3205 4355</a> or email <a href="mailto:sales@ozled.com.au">sales@ozled.com.au</a>.</p>
<h2>Showroom</h2>
<p>U1/218 Leitchs Road, Brendale QLD 4500</p>
<p>Monday to Friday, 8:00am to 5:00pm</p>
<h2>Trade customers</h2>
<p>Trade registration is completed using the <a href="/form/register-trade/#contact">trade registration page</a>.</p>`;

const CONTENT = [
  {
    path: "/shipping-details-terms-conditions",
    title: "Shipping Terms",
    summary: "Orders usually take 1–2 business days to be dispatched, and delivery within Australia can take up to 14 working days once an order leaves the warehouse. All orders are tracked.",
    seo: { title: "Shipping Terms | OzLED", description: "OzLED shipping terms: dispatch in 1–2 business days, delivery within Australia in up to 14 working days, tracking on all orders, and oversize freight." },
  },
  {
    path: "/Free-Shipping-Conditions",
    title: "Free Shipping Conditions",
    summary: "Free shipping applies when the product subtotal exceeds $99 including GST, for retail and member customers, to Australian addresses only. Trade accounts don't include free shipping.",
    seo: { title: "Free Shipping Conditions | OzLED", description: "OzLED free shipping applies to retail and member orders over $99 (inc GST) delivered to Australian addresses. Trade pricing excludes freight. Full conditions." },
  },
  {
    path: "/returns-policy/",
    title: "Warranty and Returns Policy",
    summary: "Exchanges and refunds can be made in store within 14 days of purchase. Faulty products must be returned to OzLED in Brendale for a warranty assessment, and a tax invoice is required for all returns.",
    seo: { title: "Warranty and Returns Policy | OzLED", description: "How OzLED handles exchanges, refunds and warranty assessments: 14-day in-store exchanges, returns to our Brendale store, and tax invoices required." },
    replace: [["218 Leichs Road", "U1/218 Leitchs Road"]],
  },
  {
    path: "/restricted-item-policy/",
    title: "Restricted Item Policy",
    summary: "Red or blue flashing lights, emergency siren drivers and similar items are restricted. OzLED requires a completed Restricted Item Statement before releasing any restricted item.",
    seo: { title: "Restricted Item Policy | OzLED", description: "OzLED's restricted item policy covers red and blue flashing lights and emergency sirens. A signed Restricted Item Statement is required before release." },
  },
  {
    path: "/about-us/",
    title: "About Us",
    summary: "OzLED was established in 1979 as Multisound Enterprises to supply emergency lighting and sirens, changed its name to OzLED Pty Ltd in 2005 and launched its own brand, BASE6, in 2013.",
    seo: { title: "About OzLED | OzLED", description: "OzLED began in 1979 as Multisound Enterprises, supplying emergency lighting and sirens, became OzLED Pty Ltd in 2005 and launched BASE6 in 2013." },
    drop: [/^_+$/],
  },
  {
    path: "/form/contact-us/",
    title: "Contact Us",
    summary: "Call (07) 3205 4355, email sales@ozled.com.au or visit the showroom at U1/218 Leitchs Road, Brendale QLD.",
    bodyHtml: CONTACT_BODY,
    seo: { title: "Contact OzLED | OzLED", description: "Contact OzLED on (07) 3205 4355 or sales@ozled.com.au, or visit our showroom at U1/218 Leitchs Road, Brendale QLD 4500, Monday to Friday 8am to 5pm." },
  },
];
const content = [];
for (const c of CONTENT) {
  let body = c.bodyHtml;
  if (!body) {
    const html = fixMojibake((await getText(c.path)).body);
    body = sanitize(innerAt(html, html.indexOf('<div class="responsive-content"')));
    for (const [a, b] of c.replace || []) body = body.split(a).join(b);
    for (const re of c.drop || []) body = body.replace(/<p>([\s\S]*?)<\/p>/g, (m, inner) => (re.test(text(inner).trim()) ? "" : m));
    body = body.replace(/<p>\s*<\/p>/g, "").replace(/\n{2,}/g, "\n").trim();
  }
  checkSeo(c.path, c.seo);
  content.push({ path: c.path, title: c.title, summary: c.summary, bodyHtml: body, seo: c.seo, updatedAt: TODAY });
}

// ───────────────────────── Site facts ─────────────────────────
const site = {
  name: "OzLED",
  legalName: "OzLED Pty Ltd",
  abn: "83 588 378 102",
  url: "https://www.ozled.com.au/",
  logo: "/brand/ozled-logo.png",
  telephone: "(07) 3205 4355",
  telephoneE164: "+61732054355",
  email: "sales@ozled.com.au",
  address: { streetAddress: "U1/218 Leitchs Road", addressLocality: "Brendale", addressRegion: "QLD", postalCode: "4500", addressCountry: "AU" },
  geo: { latitude: -27.3226757, longitude: 152.9798889 },
  openingHours: [{ days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "17:00" }],
  history: [
    { year: 1979, event: "Established as Multisound Enterprises to supply emergency lighting and sirens" },
    { year: 2005, event: "Renamed OzLED Pty Ltd" },
    { year: 2013, event: "Launched its own brand, BASE6" },
  ],
  foundingYear: 1979,
  ownBrand: { name: "BASE6", launched: 2013, path: "/base6/" },
  parentOrganization: { name: "OzLED Group", url: "https://ozledgroup.com.au/" },
  sameAs: [
    "https://www.facebook.com/ozledlighting/",
    "https://www.instagram.com/ozled_aus/",
    "https://www.youtube.com/channel/UCyuHpeoZRduX3wSICPsSuEQ",
    "https://www.youtube.com/user/OzLEDPtyLtd",
    "http://www.linkedin.com/company/ozled-australia-pty-ltd",
    "https://g.page/ozledlighting",
  ],
  paymentMethods: ["Visa", "Mastercard", "PayPal", "Afterpay"],
  shipping: {
    freeShippingThresholdAud: 99,
    freeShippingConditions: [
      "Product subtotal must exceed $99.00 AUD, inclusive of GST",
      "Retail and member customers only (not trade accounts)",
      "Australian addresses only",
      "Excludes some items and select suburbs due to high shipping costs",
    ],
    dispatch: "Usually 1–2 business days",
    delivery: "Up to 14 working days within Australia once fulfilled from the warehouse",
    pickup: "Pickup in store at Brendale for items shown as 'Instock - Online & Pickup Instore'",
    policyPath: "/shipping-details-terms-conditions",
    conditionsPath: "/Free-Shipping-Conditions",
  },
  footer: [
    {
      heading: "Service",
      links: [
        { label: "My Account", href: "/_myacct" },
        { label: "Track Order", href: "/_myacct/nr_track_order" },
        { label: "Trade Account Registration", href: "/form/register-trade/" },
        { label: "Resolution Centre", href: "/myacct/warranty" },
        { label: "Log Out", href: "/_myacct/logout" },
      ],
    },
    {
      heading: "About Us",
      links: [
        { label: "About Us", href: "/about-us/" },
        { label: "Our Blog", href: "/blog/our-blog/" },
        { label: "Contact Us", href: "/form/contact-us/" },
        { label: "BluePrint", href: "/blueprint/" },
        { label: "SoundOff Signal Flash Patterns", href: null, liveHref: "<iframe width=", note: "Broken link on the live site (href is a fragment of an iframe embed)" },
      ],
    },
    {
      heading: "Information",
      links: [
        { label: "Terms of Use", href: "/website-terms-of-use/" },
        { label: "Shipping Policy", href: "/shipping-details-terms-conditions" },
        { label: "Privacy Policy", href: "/privacy-policy/" },
        { label: "Returns Policy", href: "/returns-policy/" },
        { label: "Security Policy", href: "/security-policy/" },
        { label: "Restricted Item Policy", href: "/restricted-item-policy/" },
      ],
    },
    {
      heading: "Contact",
      links: [
        { label: "(07) 3205 4355", href: "tel:0732054355" },
        { label: "sales@ozled.com.au", href: "mailto:sales@ozled.com.au" },
        { label: "U1/218 Leitchs Road Brendale, QLD 4500", href: "/store-finder/" },
      ],
    },
  ],
  sources: {
    note: "All values are as stated on www.ozled.com.au on 2026-10-20.",
    openingHours: "Homepage LocalBusiness JSON-LD (lists opens as '08;00', a typo for 08:00). Hours are not shown in visible page text.",
    geo: "Homepage LocalBusiness JSON-LD",
    legalName: "About Us page ('name change in 2005 to OzLED Pty Ltd')",
    abn: "Footer",
    paymentMethods: "Payment icons on product pages (footer shows Afterpay only)",
    sameAs: "Footer social icons and homepage JSON-LD. Two different YouTube URLs are used. The JSON-LD Instagram link points to a single post, not the profile, so the footer profile is used.",
  },
};

fs.mkdirSync(OUT, { recursive: true });
const write = (f, v) => fs.writeFileSync(path.join(OUT, f), JSON.stringify(v, null, 2) + "\n");
write("hubs.json", hubs);
write("kits.json", kits);
write("banners.json", banners);
write("posts.json", posts);
write("content.json", content);
write("site.json", site);
write("redirects.json", []);
console.log(`hubs ${hubs.length}, kits ${kits.length}, banners ${banners.length}, posts ${posts.length}, content ${content.length}`);
if (problems.length) console.log("NOTES:\n- " + problems.join("\n- "));
console.error(stats);
