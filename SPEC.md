# OzLED Headless Storefront — Build Spec

**Owner:** Brenton · **Status:** Portfolio build, v1 spec · **Written:** 20 Oct 2026
**Live site today:** https://www.ozled.com.au (Neto by Maropost, theme `OzLed2021`)

---

## 0. Read this first (instructions for Claude Code)

You are building a headless front end for OzLED, an Australian LED lighting retailer (automotive, trailer, 4WD, caravan/marine, emergency/warning lights, own brand BASE6). Neto by Maropost remains the commerce back end: products, categories, pricing, stock, customers, cart, checkout and orders all stay in Neto. This repo is the storefront only.

Working rules:

1. **Build against the `DataSource` interface (§5), never against Neto directly from components.** Two implementations: `fixtures` (default, works offline with no credentials) and `neto` (live API, server-side only).
2. **Never expose Neto API credentials to the browser.** All Neto API calls run in server components, route handlers or build steps.
3. **Anything marked `VERIFY` is an assumption about Neto behaviour that must be proven in Phase 0 before code depends on it.** If it fails, stop and report; don't work around it silently.
4. **Preserve every existing URL that has search traffic** (§8.1). Losing the tail-light rankings is the single biggest way this project can fail.
5. Work phase by phase (§12). At the end of each phase, run the acceptance checks for that phase and report results before moving on.
6. Keep dependencies lean. Every new runtime dependency needs a one-line justification in `docs/decisions.md`.

---

## 1. Goals

| Goal | Measure of done |
| --- | --- |
| Fast | Mobile Lighthouse ≥ 95 performance on home, category, product. LCP < 2.0 s, INP < 200 ms, CLS < 0.05 on a mid-tier Android over 4G. |
| Clear buying journey | A shopper building a ute tray can find tail lights, licence-plate light, plugs and brackets and get them in one cart in under 2 minutes, without search. |
| SEO safe, then better | Zero loss of existing top-10 rankings at launch; every audit issue in §8.3 fixed. |
| AEO ready | Every category and product page has an answer-first summary, structured specs and valid JSON-LD that AI answer engines can quote. |
| Owner-editable | Products, prices, stock, categories, banners and content pages are still edited in the Neto control panel. No second CMS for staff to learn. |
| Portfolio quality | A design and build a competitor would want to copy: distinctive, consistent, accessible (WCAG 2.2 AA). |

### Non-goals (v1)

- Rebuilding checkout or payments (handed off to Neto, §6).
- Rebuilding customer account pages (order history, addresses, warranty/RMA): link out to Neto `/_myacct`.
- Multi-currency or international shipping.
- A new admin or CMS.

---

## 2. Context from the October 2026 audit

What the rebuild must protect and fix (Semrush AU, Sep 2026, estimates):

- **Protect:** position 1 for "tail lights", "led tail lights", "tray tail lights", "ute tail lights", "led trailer lights", "led tailgate light". Homepage + `/led-tail-lights/` drive ~24% of organic traffic.
- **Recover:** ranking keywords fell from 8,743 (Oct 2022) to 3,854. The long tail is eroding.
- **Grow (striking distance, positions 4–12):** led lights (14,800/mo), led light (4,400), camping lights (2,900), led light bar (2,400), fog lights (1,600), rock lights (1,600), reversing camera (1,600), led headlights (1,300), work light (1,300).
- **Authority:** Semrush Authority Score 14 vs Narva 40, Stedi 36, Hardkorr 34, Altiq 24.

Live bugs the old theme has (do not reproduce): malformed canonical on some products (SEO title written into the URL), JSON-LD that fails to parse, no homepage H1, most images missing alt text, empty brand pages indexed (`/brand/olight/`), slugless product URLs (`/~28162`), a footer link to `/<iframe width=`, a blank nav item, `user-scalable=0`, four simultaneous popups, three session-recording scripts.

---

## 3. Architecture

```
                 ┌───────────────────────────────────────────┐
 Browser ──────▶ │  Edge router (Cloudflare Worker)          │
                 │  www.ozled.com.au                          │
                 └───────┬───────────────────────────┬───────┘
                         │ storefront paths          │ commerce paths
                         ▼                           ▼
              ┌────────────────────┐       ┌──────────────────────────┐
              │ Next.js storefront │       │ Neto by Maropost origin  │
              │ (this repo)        │──API─▶│ /do/WS/NetoAPI (server)  │
              └────────────────────┘       │ /_mycart, /_myacct,      │
                         ▲                 │ /purchase, /form/*, …    │
                         │ webhooks        └──────────────────────────┘
                         └──────── Neto notification events ──┘
```

### 3.1 Routing: same domain via an edge router (preferred)

Serve everything on `www.ozled.com.au`. A Cloudflare Worker (the site already sits behind Cloudflare) routes:

- **To Neto origin:** `/_mycart*`, `/_myacct*`, `/purchase*`, `/form/*`, `/do/*`, `/assets/*` (product images, until migrated), plus any checkout or payment callback paths found in Phase 0.
- **To the Next.js app:** everything else.

Why: one origin means Neto's cart session cookie is first-party to the whole site, so the storefront can show a live cart count and the hand-off to checkout is seamless. No domain change for customers, payment gateways or Google.

`VERIFY` (Phase 0 spike): Neto serves correctly behind a proxy (Host header, SSL, cookies, payment-gateway callbacks, Afterpay/PayPal return URLs).

### 3.2 Fallback: commerce on a subdomain

If 3.1 fails: storefront on `www.ozled.com.au`, Neto on `shop.ozled.com.au` (or similar). Cart and account links go to the subdomain. The cart count can't be read cross-subdomain without help, so the storefront keeps its own bag (§6.2) and hands off at checkout. `VERIFY`: Neto supports moving the store to a subdomain without breaking orders, emails or gateways.

### 3.3 Stack

| Layer | Choice | Reason |
| --- | --- | --- |
| Framework | Next.js (App Router), React Server Components, TypeScript strict | SSG/ISR for SEO, streaming, image optimisation |
| Styling | Tailwind CSS with design tokens in CSS variables | Fast iteration, small CSS |
| Hosting | Vercel or Cloudflare (pick in Phase 0; must support ISR + on-demand revalidation) | |
| Search | Typesense or Meilisearch (self-hosted or cloud); Algolia acceptable. Note: Maropost owns Findify, worth asking OzLED if it's already licensed | Neto's on-site search isn't available headless |
| Data validation | Zod schemas at the `DataSource` boundary | Neto JSON is loosely typed |
| Testing | Vitest (unit), Playwright (e2e + visual), Lighthouse CI | |
| Analytics | GA4 via one consent-aware loader; Meta pixel (one ID only); one session recorder max | Audit found 3 recorders + 3 pixel IDs |

---

## 4. Neto by Maropost integration

**This is the classic Neto API, not the newer "Maropost Commerce Cloud" API at `commerce-api.maropost.com`.** OzLED runs on Neto (assets from `cdn.neto.com.au`, `assets.netostatic.com`).

- **Endpoint:** `POST https://www.ozled.com.au/do/WS/NetoAPI`
- **Headers:** `NETOAPI_ACTION: <Action>`, `NETOAPI_USERNAME`, `NETOAPI_KEY`, `Accept: application/json`, `Content-Type: application/json`
- **Auth:** a user-based API key from Neto control panel → Settings & tools → API. Create a dedicated read-only user for the storefront.
- **Every Get call needs at least one `Filter` and one `OutputSelector`.**
- **Docs:** https://developers.maropost.com/documentation/engineers/api-documentation

### 4.1 Actions used

| Need | Action | Notes |
| --- | --- | --- |
| Products, variants, specs, images, price groups, stock | `GetItem` | Filter by `SKU`, `ParentSKU`, `Brand`, `Approved`, `IsActive`; page with `Page`/`Limit`. Request only the OutputSelectors listed in `src/data/neto/selectors.ts`. |
| Category tree, category content, SEO fields | `GetCategory` | Includes `OnMenu`, `OnSiteMap`, `SortOrder`, parent IDs. |
| Content pages, blog posts, banners, brand pages, FAQs | `GetContent` | Filter by `ContentType`, `Active`. See §4.3. |
| Shipping estimate on product page (optional) | Shipping actions | `VERIFY` which action returns a quote by postcode + SKU. |
| Cache invalidation | Notification Events (webhooks) | Subscribe to product, category, stock and content updates → `/api/revalidate`. `VERIFY` exact event names and payloads. |

Customer, order and payment actions are **not** used by the storefront in v1.

### 4.2 Sync strategy

- **Build / ISR:** category and product pages statically generated, revalidated on webhook plus a 1-hour safety TTL.
- **Stock and price freshness:** product page shows stock from a lightweight server route (`/api/stock?sku=`) cached 60 s, so a sold-out item doesn't show "In stock" for an hour.
- **Search index:** rebuilt nightly from `GetItem`, updated incrementally on product webhooks.
- **Rate limits:** `VERIFY` Neto's limits; queue and back off on 429. Never fan out more than 5 concurrent API calls.

### 4.3 Owner-editable content in Neto

Staff keep using the Neto control panel. Map storefront slots to Neto content:

| Storefront slot | Neto source |
| --- | --- |
| Homepage hero (1 primary + up to 2 secondary) | Content type `Homepage Banner` (create it): fields for image (desktop + mobile), headline, subhead, CTA label, CTA URL, start/end date, sort order |
| Promo strip (one line, top of site) | Content type `Site Notice` |
| Application hub copy (§7.2) | Content type `Application Hub`: answer-first summary, FAQs, linked categories |
| Category intro + FAQs | Category description fields (split on a marker, e.g. `<!--faq-->`) |
| Blog | Existing blog content |
| Brand pages | Content type `Brand` |

`VERIFY`: custom content types and their custom fields are returned by `GetContent` with the needed OutputSelectors. If not, fall back to structured HTML in the description field with documented markers.

---

## 5. Data layer

All components consume normalised types from `src/data/types.ts`. Implementations live in `src/data/fixtures/` and `src/data/neto/`, selected by `DATA_SOURCE=fixtures|neto`.

```ts
interface DataSource {
  getProduct(slug: string): Promise<Product | null>;
  getProductsByCategory(categoryId: string, opts: ListOpts): Promise<Page<ProductCard>>;
  getCategoryTree(): Promise<Category[]>;
  getCategory(slug: string): Promise<Category | null>;
  getApplicationHub(slug: string): Promise<ApplicationHub | null>;
  getKit(slug: string): Promise<Kit | null>;
  getBanners(slot: 'home-hero' | 'site-notice'): Promise<Banner[]>;
  getContentPage(slug: string): Promise<ContentPage | null>;
  getBlogPosts(opts: ListOpts): Promise<Page<BlogPostCard>>;
  getRedirects(): Promise<Redirect[]>;
}
```

Key normalised fields on `Product`: `sku`, `parentSku`, `slug`, `name`, `brand`, `price` (retail, inc GST), `rrp`, `images[]` (with alt), `stock` (`in_stock | low | backorder | out`), `pickupAvailable`, `specs` (typed: voltage, IP rating, dimensions mm, LED count, functions, mount, plug, ADR approval numbers, warranty years, cable length), `applications[]` (ute-tray, trailer, truck, 4wd, caravan, marine, emergency), `compatibleWith[]` (SKUs: plugs, brackets, resistors), `restricted` (boolean, §7.6), `reviews` (count, average, list), `datasheetUrl`, `videoUrl`, `seo` (title, description, canonical path).

`VERIFY`: where `applications`, `compatibleWith` and typed specs live in Neto (item specifics, custom fields, or cross-sell relationships). Phase 0 output: a field-mapping table in `docs/neto-field-map.md`.

### 5.1 Fixtures (portfolio mode)

The build must run end to end with no Neto credentials.

- Fixtures cover: full category tree, ~60 products spread across tail lights (plug-and-play, combination, trailer), licence-plate lights, plugs/sockets, brackets, light bars, work lights, camping/amber lights, warning beacons; 2 application hubs fully populated (Ute & Tray Builds, Trailer & Boat); 2 kits; 3 banners; 3 blog posts.
- Product names and specs may mirror real public listings for realism. **Before publishing the portfolio publicly, get the owner's OK to use OzLED's name, product photos and data**, or swap to placeholder imagery.

---

## 6. Cart and checkout

The storefront never takes payment. Checkout, payment (card, PayPal, Afterpay), shipping calculation, member/trade pricing and order creation all happen in Neto.

### 6.1 Add to cart (same-domain routing, §3.1)

Neto documents query-string cart URLs on `/_mycart`:

- Single item: `/_mycart?sku=<SKU>&qty=<n>`
- Multiple items: `/_mycart?multi=<count>&sku0=<SKU>&qty0=<n>&sku1=<SKU>&qty1=<n>…`
- Apply coupon: `addcpn=<CODE>`
- Straight to checkout: `fn=payment`

Docs: https://developers.maropost.com/documentation/neto-designer-documentation/news-and-tips/cart-and-checkout-urls

Behaviour:

1. "Add to cart" issues a same-origin `fetch('/_mycart?sku=…&qty=…')`, then opens the storefront's cart drawer.
2. The cart drawer reads the live cart. `VERIFY`: a JSON or parsable endpoint for current cart contents (Neto's mini-cart AJAX, or a minimal custom Neto template page that renders cart JSON). If none exists, the drawer shows the line just added plus a "View cart" link to `/_mycart`.
3. "Checkout" → `/_mycart?fn=payment`.
4. Kits (§7.3) add all lines in one request using `multi`.

### 6.2 Add to cart (subdomain fallback, §3.2)

Storefront keeps a local bag (localStorage, try/catch wrapped). "Checkout" navigates to `https://shop.ozled.com.au/_mycart?multi=…&fn=payment` with every line, then clears the local bag. Accept the known limitation: items already in the Neto cart from an earlier session are merged by Neto.

### 6.3 Pricing display

- Storefront shows retail price inc GST, RRP and the saving.
- Member and trade pricing is applied by Neto in the cart. Product pages show: "Trade or member? Your price is applied at checkout." with links to sign in (`/_myacct`) and trade registration.
- `VERIFY` stretch goal: with same-domain routing, detect a signed-in Neto session and show the customer's group price. Do not build until verified.

### 6.4 Checkout styling

Re-skin Neto's cart and checkout templates (B@SE templates) with the new design tokens so the seam is invisible: same header, fonts, colours and footer. This is the one piece of Neto theme work in scope.

---

## 7. Information architecture and journeys

### 7.1 Navigation

Two ways in, side by side in the main nav:

- **Shop by job** (new): Ute & Tray Builds · Trailer & Boat · 4WD & Touring · Caravan & RV · Marine · Emergency & Fleet
- **Shop by product** (existing tree, cleaned up): Tail Lights · Bulbs & Headlights · Driving & Light Bars · Work Lights · Indicators & Markers · Warning & Emergency · Camping & Interior · Wiring, Plugs & Switches · Reverse Cameras · BASE6

Header: one row on desktop (logo, both menus, search, account, cart), plus a single-line site notice above. Under 72 px tall on desktop, 56 px on mobile. Phone number and "Pickup in Brendale" live in the notice strip and footer, not the header.

Mobile: bottom-anchored search bar on category and home; full-screen menu with the two entry points as tabs.

### 7.2 Application hub pages (`/ute-tray-lights/`, `/trailer-lights/`, …)

Each hub is a landing page that ranks and sells:

1. H1 + answer-first summary (40–60 words answering "what lights does a ute tray need?").
2. "What you need" checklist: tail lights (pair), licence-plate light, plug/socket, mounting brackets, wiring, optional reverse/work lights. Each line links to a filtered product list.
3. Featured kit (§7.3).
4. Top products for that job (filtered by `applications`).
5. ADR compliance explainer (short, factual, links to datasheets).
6. FAQs (5–8, real questions; FAQPage JSON-LD).
7. Related guides from the blog.

Slugs: `VERIFY` with Semrush before finalising. Where an existing category URL already ranks for the hub's core term (e.g. "tray tail lights" → `/led-combination-tail-lights/`), keep that URL ranking for the product list and link the hub to it. Don't cannibalise it.

### 7.3 Kits ("Build your tray lighting")

A step-through builder:

1. Pick tail lights (filterable: size, functions, plug-and-play vs bare wire, budget).
2. Licence-plate light (pre-filtered to compatible).
3. Plug and socket (by vehicle plug type: 7-pin flat, 7-pin round, 12-pin, Anderson).
4. Brackets and load resistors (only those in `compatibleWith`, and only in stock).
5. Review: line items, total, "Add kit to cart" (single `multi` request).

Out-of-stock or backordered items are never pre-selected and are shown with their status. The old site recommended backordered cross-sells; don't repeat that.

### 7.4 Category page

- H1 + 1–2 sentence answer-first intro above the grid; long-form copy and FAQs below the grid.
- First product row visible above the fold at 390×844 and 1440×900.
- Filters (buyer language only): Application · Functions (stop/tail/indicator/reverse) · Mount (horizontal/vertical/surface/recessed) · Size · Plug type · Voltage · IP rating · Brand · Price · In stock. Hide internal attributes ("Pcb Colour", "Blister").
- Filters update URL query params. Filtered URLs: `noindex, follow` and canonical to the unfiltered category, except a curated allowlist of indexable filter pages (e.g. "12–24V tail lights").
- Product card: full name (2-line clamp, never cut mid-word), image, brand, rating + count, stock chip, price + RRP, one primary action. Afterpay line only on the product page.
- Sort: Best selling, Price low–high, Price high–low, Newest, Rating.
- Pagination: "Load more" with real paginated URLs underneath (`?page=2`) for crawlers.

### 7.5 Product page

Above the fold: gallery (zoom, video if available), name (H1), brand, rating + count, price, RRP saving, stock + pickup status, quantity, Add to cart, shipping line ("Free shipping over $99, excludes some remote postcodes"), trade/member line.

Below:

1. Key specs card (typed specs, icons, mm and volts).
2. "Will it suit my build?": applications, mounting and plug notes.
3. "You'll also need": in-stock `compatibleWith` items, one-tap add.
4. Description (answer-first first paragraph).
5. Downloads: datasheet, install guide.
6. Video (lite YouTube embed, loads on click).
7. Reviews with count, average and distribution; "Write a review" links to Neto.
8. FAQs.

Mobile: sticky add-to-cart bar after the main button scrolls out of view.

### 7.6 Restricted items (red/blue lights, emergency sirens)

Products flagged `restricted` show price and specs but replace Add to cart with "Authorised buyers only — request a quote", linking to the trade form. Mirror OzLED's existing restricted-item policy text. `VERIFY` how Neto flags these today.

### 7.7 Trade and fleet

`/trade/` page: benefits, who qualifies, application form (posts to Neto `/form/register-trade/`), fleet quote request (multi-line SKU + qty form → Neto form or email). Shown in the footer and in the header account menu, not as a top-level nav item.

### 7.8 Search

Instant results panel: products (image, name, price, stock), categories, guides. Typo tolerance, synonyms (`tail light`/`taillight`/`tail lamp`, `number plate`/`licence plate`/`rego light`, `light bar`/`lightbar`). Zero-result page suggests hubs and top categories. Search pages `noindex`.

### 7.9 Interruptions policy

Exactly one marketing prompt site-wide: an email capture with a concrete offer, shown on exit intent (desktop) or after 2 product views (mobile), suppressed for 30 days after dismissal or signup, never on cart or checkout. Chat (Podium or replacement) loads only after user interaction with a lightweight launcher. No "someone just bought" toasts.

---

## 8. SEO

### 8.1 URL preservation and redirects (launch blocker)

- Keep every existing category and product URL that has impressions in Search Console or rankings in Semrush. Same path, same trailing-slash convention.
- Slugless products (`/~28162` style): give each a keyword slug and 301 the old path to it.
- Build `redirects.csv` from: Search Console pages export (last 16 months), Semrush pages export, Neto sitemap. Every old URL returns 200 (same page) or 301 (one hop to its new home). No 404s, no chains.
- Empty brand or category pages: 301 to the closest live category.
- Edge router serves redirects before any app code.

### 8.2 Per-page rules

- One H1 per page. Titles ≤ 60 chars, `{Primary keyword} | OzLED`. Meta descriptions 140–160 chars, written, not spec dumps.
- Canonical = absolute URL of the clean path, generated from the route, never from a title field.
- Open Graph + Twitter tags generated with the canonical.
- All images: descriptive alt (template default `{product name} – {view}`), width/height set, AVIF/WebP via the image pipeline.
- Breadcrumbs from a single primary category per product (no "All Products, Excluding Exceptions").
- XML sitemaps split by type (products, categories, hubs, content), with `lastmod` from Neto update timestamps.
- `robots.txt`: allow all; disallow `/_mycart`, `/_myacct`, `/search`, faceted parameters; point to sitemaps.
- Internal linking: hubs ↔ categories ↔ products ↔ guides, all in server-rendered HTML.

### 8.3 Fixes carried over from the audit (each one is a test)

- [ ] No malformed canonicals (test: every canonical parses as a URL on `www.ozled.com.au`).
- [ ] JSON-LD validates on every template (test: parse + schema.org validation in CI).
- [ ] Homepage has exactly one H1.
- [ ] 0 images without alt on home, category and product templates.
- [ ] No indexable empty listing pages (test: any listing with 0 products returns 404 or 301).
- [ ] No broken internal links (crawl in CI).
- [ ] Viewport allows zoom.

### 8.4 Structured data (JSON-LD only)

| Template | Types |
| --- | --- |
| All pages | `Organization` (+ `logo`, `sameAs` socials), `WebSite` with `SearchAction` |
| Home + contact | `AutoPartsStore` (LocalBusiness) for the Brendale showroom: address, phone, opening hours, geo |
| Category | `CollectionPage`, `BreadcrumbList`, `ItemList` (first page of products) |
| Product | `Product` with `brand`, `sku`, `mpn`, `gtin` if available, `image[]`, `offers` (`Offer`: price, priceCurrency AUD, availability, itemCondition, shippingDetails, hasMerchantReturnPolicy), `aggregateRating` + `review[]` only when reviews exist |
| Hubs / FAQs | `FAQPage` |
| Guides | `Article` / `BlogPosting` with author and dates |
| Videos | `VideoObject` |

---

## 9. AEO (answer engines)

Goal: when someone asks an AI assistant "what tail lights do I need for a ute tray in Australia?" or "are Maxilamp 3 ADR approved?", OzLED is the source quoted.

- **Answer-first blocks:** every hub, category and guide opens with a 40–60 word direct answer, then detail. Rendered as plain HTML text, not images or accordions that hide it from crawlers.
- **Facts as structure:** specs in `<table>` / `<dl>` with units; ADR approval numbers as text; compatibility as lists.
- **Question-led FAQs** from real customer questions (ask OzLED staff for the top 20 phone/email questions).
- **Comparison pages:** e.g. "Maxilamp 3 vs Maxilamp C3", "LED vs halogen tail lights", "7-pin flat vs 7-pin round".
- **Authorship and trust:** guides carry a named author with role, last-reviewed date, and "40+ years supplying emergency services" stated once, factually.
- **Crawler access:** allow major AI crawlers in robots.txt unless OzLED objects (owner decision); publish `/llms.txt` summarising the site sections and key guides.
- **No unsupported superlatives** ("Australia's #1", "Best prices"). Use verifiable claims: founded 1979, Brendale showroom, review count, BASE6 own brand since 2013.

---

## 10. Design direction

Brand cues to keep: OzLED wordmark, black/white/red palette, bold condensed italic display type (current site uses a heavy italic sans). Modernise, don't rebrand.

- **Tone:** industrial, technical, confident. Light is the product: use real night photography of lights on vehicles (tray, trailer, 4WD, emergency) as the hero material, not product-on-white collages.
- **Tokens:** define in `src/styles/tokens.css`: colours (neutral 0–950, brand red, signal amber for indicator/warning accents, success/warning/error), type scale (display condensed italic; body a highly legible sans; mono for SKUs/specs), spacing 4-pt scale, radii, shadows, motion durations. Dark mode supported but light is default.
- **Product imagery:** consistent square crops on a neutral background; second image on hover shows the light lit.
- **Spec presentation:** icon + value chips (12–24V, IP67, ADR, 7-yr warranty) on cards and product pages.
- **Motion:** subtle, purposeful (drawer, filter transitions); respect `prefers-reduced-motion`.
- **Accessibility:** WCAG 2.2 AA contrast, visible focus, full keyboard navigation of menus, filters and kit builder; form labels; 44 px touch targets.

Deliver a small component gallery route (`/_styleguide`, `noindex`, disabled in production) showing every token and component state.

---

## 11. Performance budget

| Asset | Budget (per page, compressed) |
| --- | --- |
| JS (first load) | ≤ 120 KB |
| CSS | ≤ 40 KB |
| Hero image | ≤ 120 KB mobile, ≤ 250 KB desktop, preloaded |
| Web fonts | ≤ 2 families, ≤ 4 files, `font-display: swap`, self-hosted, subset |
| Third-party scripts before interaction | GA4 only (via consent-aware loader) |

Enforced by Lighthouse CI and `size-limit` on every PR.

---

## 12. Phases and acceptance checks

### Phase 0 — Spikes (resolve every `VERIFY`)

Deliverables: `docs/neto-field-map.md`, `docs/routing-spike.md`, `docs/decisions.md`.
Checks: proxy routing works end to end on a staging hostname including a test checkout (or documented fallback chosen); `GetItem`, `GetCategory`, `GetContent` return the fields needed; webhook received and logged; cart contents readable (or fallback chosen).
*Portfolio mode note:* if no API access yet, write the spikes as a checklist and continue on fixtures.

### Phase 1 — Foundations

Repo scaffold, tokens, layout shell (header, footer, notice strip), `DataSource` interface + fixtures, `/_styleguide`, CI (lint, typecheck, unit, Lighthouse CI).
Checks: `pnpm build` passes on fixtures; Lighthouse ≥ 95 on a placeholder page.

### Phase 2 — Browse

Home, category (filters, sort, pagination), product page, search.
Checks: first product row above the fold at both viewports; all §8.2/§8.3 tests green; JSON-LD validates; keyboard-only browse works.

### Phase 3 — Journeys

Application hubs (Ute & Tray, Trailer & Boat first), kit builder, cart drawer + hand-off, restricted-item flow, trade page.
Checks: Playwright test "build a tray kit and reach checkout" passes in < 2 minutes of scripted steps; restricted products cannot be added to cart.

### Phase 4 — Live data

Switch to `DATA_SOURCE=neto` on staging; webhooks + ISR; search index sync; checkout re-skin.
Checks: product change in Neto appears on staging within 2 minutes; stock route accurate; prices match Neto cart.

### Phase 5 — SEO migration and launch

Redirect map, sitemaps, Search Console verification, crawl comparison old vs new (every old URL accounted for), analytics parity.
Checks: 0 broken URLs from the old-URL list; 0 redirect chains; Core Web Vitals budgets met on staging; owner sign-off.
After launch: daily rank and 404 monitoring for 4 weeks.

---

## 13. Repo layout

```
/app
  /(store)
    page.tsx                      # home
    [...slug]/page.tsx            # resolves category | product | content | hub by slug
    search/page.tsx
    trade/page.tsx
  /api
    revalidate/route.ts           # Neto webhooks
    stock/route.ts
  /_styleguide/page.tsx
/src
  /components                     # ui primitives + commerce components
  /data
    types.ts
    index.ts                      # picks DataSource from env
    /fixtures
    /neto
      client.ts                   # signed POSTs to /do/WS/NetoAPI, retries, 429 backoff
      selectors.ts                # OutputSelectors per call
      mappers.ts                  # Neto JSON → normalised types (Zod)
  /seo                            # metadata builders, JSON-LD builders
  /styles/tokens.css
/edge
  worker.ts                       # Cloudflare Worker router + redirects
  redirects.csv
/docs
  decisions.md
  neto-field-map.md
  routing-spike.md
/tests
  /e2e
  /unit
SPEC.md
```

Slug resolution: one catch-all route resolves a path against a prebuilt slug index (categories, products, content, hubs) so existing flat Neto URLs (`/led-tail-lights/`, `/maxilamp-3-series-led-combination-tail-lights-pair`) keep working unchanged.

### Environment variables

```
DATA_SOURCE=fixtures            # fixtures | neto
NETO_API_URL=https://www.ozled.com.au/do/WS/NetoAPI
NETO_API_USERNAME=
NETO_API_KEY=
NETO_WEBHOOK_SECRET=
SEARCH_HOST=
SEARCH_API_KEY_ADMIN=           # server only
NEXT_PUBLIC_SEARCH_API_KEY=     # search-only key
NEXT_PUBLIC_SITE_URL=https://www.ozled.com.au
NEXT_PUBLIC_GA4_ID=
```

---

## 14. Open questions for OzLED

1. OK to use OzLED's name, photos and product data in a public portfolio piece?
2. Will they provide a read-only Neto API user for a staging build?
3. Which apps must survive: Podium, TrustSpot, SmartrMail, ActiveCampaign, Afterpay messaging? Which can go?
4. Is Findify (Maropost's search) already licensed?
5. Top 20 customer questions by phone/email (for FAQs and AEO).
6. Night photography of lights on vehicles: do they have any, or is a shoot in scope?
7. Restricted-item rules: who qualifies, and how is that checked today?
8. AI crawler policy: allow or block?
