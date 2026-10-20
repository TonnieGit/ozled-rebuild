# Neto field map (Phase 0)

Maps every normalised field in `src/data/types.ts` (SPEC §5) to where it lives in Neto.

**Status:** Draft. No API credentials yet. The API endpoint is live (`POST /do/WS/NetoAPI` → `Invalid Secret/Access Key` without a key), but nothing below has been confirmed against real API responses. The **Seen on live site** column records what the public product and category pages show (20 Oct 2026). **Confidence** applies to the Neto source:

- **High:** standard Neto field, documented, near certain.
- **Med:** standard field, but naming or format needs a check.
- **Low:** no obvious home in Neto. Needs an owner decision or data work.

---

## 1. Product (`GetItem`)

| Normalised field | Proposed Neto source (OutputSelector) | Confidence | Seen on live site / notes |
| --- | --- | --- | --- |
| `sku` | `SKU` | High | e.g. `LEDMAXILAMPC3XR` |
| `parentSku` | `ParentSKU` | High | Variant families exist (`…~947`, `…~951` look like siblings). |
| `slug` | `ItemURL` (strip host and leading `/`) | Med | Products are flat, with no trailing slash, often truncated (`…-led-tail-light-sin`). **1,359 of 2,955 sitemap URLs are slugless `/~ID`.** See §6. |
| `name` | `Name` | High | |
| `brand` | `Brand` | High | |
| `price` | `DefaultPrice`, or `PriceGroups` for the retail group | Med | VERIFY that it's tax-inclusive (store `TaxInclusive` setting). Show inc GST. |
| `rrp` | `RRP` | High | |
| `images[]` | `Images` (`URL`, `Name`, thumbnails) | Med | Neto images have no alt field, so use the template default `{name} – {view}` (SPEC §8.2). |
| `stock` | `AvailableSellQuantity` (+ `WarehouseQuantity` per warehouse) | Med | Derive `in_stock / low / backorder / out`. VERIFY the low-stock threshold and how preorder/backorder is flagged. |
| `pickupAvailable` | `WarehouseQuantity` for the Brendale warehouse | Med | VERIFY the warehouse ID. |
| `specs.*` (voltage, IP, dimensions, LED count, functions, mount, plug, ADR, warranty, cable) | **No structured source found.** Candidates: `ItemSpecifics`, custom fields `Misc01…Misc52`, `Specifications` | **Low** | **Specs are free-text bullets inside `Description` today** ("IP67 100% Water proof", "12-24 Volt", "7 Year Warranty", "ADR approved"). See §5. |
| `applications[]` | Category membership (`Categories`) or a custom field | Low | No explicit field. Could be derived from category tree (e.g. `boating-marine/boat-trailer-tail-lights/` → trailer, marine). |
| `compatibleWith[]` | `CrossSellProducts` / `UpsellProducts` / related items | Low–Med | Product page shows an "Accessories" area. VERIFY which relationship it uses. SPEC wants only compatible, in-stock items. |
| `restricted` | Category (e.g. "Red & Blue Restricted Kits") or a custom field | Low | **Restricted items keep a normal Add to cart button today.** Policy is text only. See §5. |
| `reviews` | **TrustSpot**, not Neto (`trustspot.io/assets/js/trustspot_product_reviews.js` on product pages) | Med | Needs a TrustSpot API key for counts, averages and lists. JSON-LD only when reviews exist. |
| `datasheetUrl` | Custom field or the `/downloads-page/` content | Low | |
| `videoUrl` | Custom field or embedded YouTube in `Description` | Low | YouTube embeds appear on pages (`youtube-nocookie.com`). |
| `seo.title` | `SEOPageTitle` → fallback `Name` | High | Live titles are often just the raw name with a trailing space. |
| `seo.description` | `SEOMetaDescription` | High | |
| `seo.canonicalPath` | **Generated from the route, never from Neto** | — | `SEOCanonicalURL` is the source of the malformed-canonical bug (SPEC §2). Ignore it. |
| `gtin` / `mpn` | `UPC` / `ModelNumber` | Med | For Product JSON-LD. |
| `updatedAt` | `DateUpdated` | High | Sitemap `lastmod`. |

Proposed `selectors.ts` for `GetItem`:

```
ID, SKU, ParentSKU, Name, Brand, Model, ItemURL, Approved, IsActive, Visible,
DefaultPrice, PriceGroups, RRP, PromotionPrice, TaxInclusive,
AvailableSellQuantity, WarehouseQuantity, Images, Categories,
Description, ShortDescription, Features, Specifications, ItemSpecifics,
CrossSellProducts, UpsellProducts, UPC, SEOPageTitle, SEOMetaDescription,
DateUpdated, Misc01…Misc10 (once custom-field assignments are known)
```

VERIFY each name against the live API. Neto returns an error for unknown selectors, so the Phase 0 script should try them one by one and log which succeed.

## 2. Category (`GetCategory`)

| Normalised field | Neto source | Confidence | Notes |
| --- | --- | --- | --- |
| `id`, `parentId` | `CategoryID`, `ParentCategoryID` | High | |
| `name` | `CategoryName` | High | |
| `slug` / path | Category URL | Med | **Two URL styles live today:** flat (`/led-tail-lights/`, 111 single-segment slashed URLs) and nested (`/automotive/led-tail-lights/sequential-led-tail-lights/`). Both must keep working. |
| `onMenu`, `onSitemap`, `sortOrder`, `active` | `OnMenu`, `OnSiteMap`, `SortOrder`, `Active` | High | |
| `intro`, `body`, `faqs` | `Description` fields, split on `<!--faq-->` (SPEC §4.3) | Med | |
| `seo.*` | `SEOPageTitle`, `SEOMetaDescription`, `SEOPageHeading` | High | e.g. "Automotive LED Tail Lights - Car LED Tail Lights \| OzLED". |

## 3. Content (`GetContent`)

| Storefront slot | Neto source | Confidence | Notes |
| --- | --- | --- | --- |
| Blog posts | Content type for `/blog/*` (66 URLs, some nested like `/blog/our-blog/…`) | Med | Author and dates for `BlogPosting`. |
| Brand pages | `/brand/*` (37 URLs) and `/brands/*` (6) | Med | Two prefixes. Some are empty (`/brand/olight/` → 200). 301 empties. |
| Content pages | Flat slugs (`/downloads-page/`, `/flash-pattern/`, `/blueprint/`) | Med | |
| Homepage Banner, Site Notice, Application Hub | New custom content types | Low | VERIFY that `GetContent` returns custom fields. Fall back to HTML markers in the description. |

## 4. Other VERIFY items

| Item | Finding so far | Next step |
| --- | --- | --- |
| Cart contents (SPEC §6.1.2) | **Resolved in principle:** `POST /ajax/addtocart` with `proc=ShowItem` + CSRF returns cart JSON-like NSD1 data. See `routing-spike.md` §1. | Confirm through the proxy on staging. |
| Shipping quote (SPEC §4.1) | The theme already uses `$.load_ajax_template('_shipping_calculator', {sku, qty, ship_zip, ship_country})`, a same-origin AJAX template, not the API. | Use the same-origin call if same-domain routing works. Otherwise VERIFY an API shipping action. |
| Webhooks (Notification Events) | Not testable without control-panel access. | Set up an endpoint (e.g. a request bin), subscribe to product, stock, category and content events, and log real payloads. |
| Rate limits | Unknown. | Ask Neto support. Throttle to 5 concurrent calls regardless (SPEC §4.2). |
| Search | Findify not seen on the site. `ajax_search` is Neto native. | Still need to ask OzLED (SPEC §14.4). |

## 5. Data work this implies (raise with OzLED)

The SPEC's typed specs, filters (Functions, Mount, Plug, Voltage, IP rating), `applications`, `compatibleWith` and `restricted` assume structured data **that doesn't exist in Neto today.** Options:

1. **Enrich in Neto (recommended):** create Item Specifics or custom fields for the filterable specs, an "Applications" multi-select and a "Restricted" flag. Staff keep editing in Neto (SPEC goal "Owner-editable"). This is one-off data entry across ~1,600 products, which can be bulk-imported via CSV.
2. **Parse descriptions** at sync time with regex extraction (e.g. `IP6[5-9]`, `\d+-\d+ ?V(olt)?`, `\d+ ?Year Warranty`). This is quick to build but fragile. Use it only to pre-fill option 1's CSV.

For fixtures (portfolio mode), specs are hand-authored as typed data, as if option 1 were done.

## 6. URL inventory snapshot

Full list: `docs/research/sitemap-urls-2026-10-20.txt` (2,955 URLs from `sitemap_1.xml.gz`).

| Pattern | Count | Example | Handling |
| --- | --- | --- | --- |
| Slugless product `/~ID` | 1,359 | `/~168198` (title "3852 Series Plug & Play Kit to Suit Mazda BT50 2021 - Present…") | New keyword slug + 301 (SPEC §8.1). Generate slugs from `Name`. |
| Slug + id `/slug~ID` | 286 | `/universal-undercover-led-insert-light-colour-green~6497` | Probably variant or duplicate URLs. VERIFY the canonical, then 301 to the parent or keep. |
| Flat, no trailing slash | 983 | `/led-autolamps-tail-light-maxilamp-3-series` | Products and some content. Keep as-is. |
| Flat, trailing slash | 111 | `/led-tail-lights/` | Categories and content. Keep as-is. |
| Nested category paths | ~100 | `/automotive/led-tail-lights/sequential-led-tail-lights/` | Keep as-is. |
| Mixed-case paths | 195 | `/LED-Headlight-Conversions`, `/2018-AFAC-Emergency-Trade-Show` | Serve exactly as-is (case-sensitive match). Don't lowercase-redirect at launch. |
| Junk / test | a few | `/testing-page/`, `/ledso284-Master` | Review. 301 or drop from sitemap. |

The catch-all slug resolver (SPEC §13) must match on the exact path, including trailing slash and case.
