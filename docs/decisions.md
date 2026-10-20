# Decisions

One line of reasoning per decision. Newest last. Every runtime dependency gets an entry (SPEC §0.6).

| # | Date | Decision | Why |
| --- | --- | --- | --- |
| 1 | 2026-10-20 | Build the headless storefront per SPEC.md. A sellable Neto B@SE theme is a separate, future product. | Headless can't be installed as a Neto theme. Keep scope on the OzLED build. |
| 2 | 2026-10-20 | Use OzLED's real name, branding, photos and data, with no "portfolio/demo" notices on the site. | Owner (Andrew) gave full permission. The build is pitched as their new site. Resolves SPEC §5.1 and §14.1. |
| 3 | 2026-10-20 | **Hosting: Vercel**, deployed from `github.com/TonnieGit/ozled-rebuild`. | Supports ISR + on-demand revalidation (SPEC §3.3) with no extra setup. Brenton's choice. |
| 4 | 2026-10-20 | Package manager: pnpm via Node's `corepack` (Node 24 installed locally). | SPEC checks use `pnpm build`. Corepack avoids a global install. |
| 5 | 2026-10-20 | Cart is behind a `CartClient` interface: `neto-ajax` (same-origin `/ajax/addtocart`) and `local-bag` (SPEC §6.2). Fixtures mode uses `local-bag`. | Routing (§3.1 vs §3.2) is unresolved. Both outcomes stay cheap. See `routing-spike.md`. |
| 6 | 2026-10-20 | Add `/ajax/*` and `/myacct/*` to the Worker's commerce-path list. | Found in live `main.js` and footer links. Missing from SPEC §3.1. |
| 7 | 2026-10-20 | Slug resolution matches exact path, including case and trailing slash. | The live site mixes `/flat`, `/flat/`, nested and mixed-case URLs. Normalising would break ranked URLs (SPEC §8.1). |
| 8 | 2026-10-20 | Fixture specs are hand-authored typed data. The live Neto mapping needs a data-enrichment decision from OzLED. | Live specs are free text in descriptions. See `neto-field-map.md` §5. |
| 9 | 2026-10-20 | Reviews come from TrustSpot, behind the `DataSource` (fixtures in portfolio mode). | TrustSpot is the review source on the live site, not Neto. |
| 10 | 2026-10-20 | No write calls against the live Neto store during Phase 0 (no `AddItem`, no test orders). | Probes were read-only and guest-only. Write tests wait for a staging host. |
| 11 | 2026-10-20 | **Fully standalone until the pitch.** Fixtures are the real data source, built from OzLED's public pages. Specs and documents are structured fields. | No API access until Andrew approves the design. He agreed specs (and datasheets/fitting instructions) must be structured. |
| 12 | 2026-10-20 | Next.js **16.4** (App Router, Cache Components + Partial Prefetching on), React 19.3, Tailwind 4, TypeScript strict. | Current stable. Cache Components gives static shells + ISR-equivalent per URL, which suits ~1,600 product pages. |
| 13 | 2026-10-20 | **One catch-all route, one template per page type** (product, category, hub, kit, content, post). Sections show or hide from data. | Brenton's requirement: no per-product pages. Also SPEC §13. |
| 14 | 2026-10-20 | Data model as **Zod schemas** (`src/data/schema.ts`), with types inferred. Fixtures are validated on load, so a bad fixture fails the build. | SPEC §3.3 (Zod at the boundary). One source of truth for both sources. |
| 15 | 2026-10-20 | `DataSource` lookups take **exact legacy paths**, and `resolvePath()` was added. `listProducts()` was added for site-wide lists. | Preserves every URL exactly (SPEC §8.1). The spec's `slug` arguments become exact paths. |
| 16 | 2026-10-20 | Shared **in-memory source** (`memory.ts`). The Neto adapter loads a catalogue snapshot (cached 1 h, tag `catalogue`, revalidated by webhook) and serves it through the same code. | Identical filtering and sorting in both modes. ~1,600 items fits in memory easily. |
| 17 | 2026-10-20 | **Trailing slashes preserved via `proxy.ts`**: `/x/` is rewritten to an internal `/x/__ts` marker. The wrong variant 301s to the right one in one hop. `skipTrailingSlashRedirect: true`. | The live site mixes both forms. Next would otherwise normalise one away and break ranked URLs. |
| 18 | 2026-10-20 | Legacy redirects are served in `proxy.ts` (and in the edge Worker when deployed) from `redirects.json`, before app code. | SPEC §8.1. Works on Vercel alone, without the Worker. |
| 19 | 2026-10-20 | Neto-owned links (`/_myacct`, `/form/…`) go through `commerceUrl()`. While standalone they point at the live store (`NEXT_PUBLIC_COMMERCE_ORIGIN`). | Account, trade-registration and checkout links work in the pitch build. |
| 20 | 2026-10-20 | Cart in pitch mode = **local bag**. Checkout sends every line to the live Neto cart via `/_mycart?multi=…&fn=payment`. | A real hand-off with no proxy. Neto's documented URL format. |
| 21 | 2026-10-20 | Neto AJAX cart client implemented from the live `main.js` (`AddItem`, `AddMultiItems`, `ShowItem`, `RemoveItem`, NSD1 codec, CSRF retry). Unit-tested against **real captured responses**. | Ready for routing Option A with no rework. |
| 22 | 2026-10-20 | Fonts: **Barlow Condensed 800 italic** (display) + **Inter** variable (body), self-hosted via `next/font`. 2 files total. Mono = system stack. | Modern take on the current heavy italic wordmark. Within the SPEC §11 budget (≤ 2 families, ≤ 4 files). |
| 23 | 2026-10-20 | Colours: brand red `#ed1f24` for graphics and large type only. **Action red `#d7141a`** for buttons and text (5.2:1 with white). Signal amber `#f5a400`. Neutral graphite scale. Header and footer always dark. | WCAG 2.2 AA. Brand red alone is 4.35:1, which fails AA for small text. |
| 24 | 2026-10-20 | Tokens are prefixed `--oz-*` and mapped into Tailwind via `@theme inline`. | Avoids circular variables with Tailwind's own `--color-*` / `--text-*` names. |
| 25 | 2026-10-20 | No icon library: an inline SVG set (`components/icon.tsx`). | JS/CSS budgets. |
| 26 | 2026-10-20 | Mega menus use the **disclosure pattern** (buttons + `aria-expanded`, Esc returns focus), not ARIA `menu`. Mobile menu, cart and filter sheets use native `<dialog>`. | Correct semantics for site navigation. Focus trapping and Esc come free. |
| 27 | 2026-10-20 | Search: **in-process search** (synonyms, typo tolerance, SKU match) behind `/api/search`. Typesense/Meilisearch deferred until the full catalogue is live. | ~60 fixture products don't justify a hosted service. Same function signature to swap later. |
| 28 | 2026-10-20 | Filters are **real links with `rel=nofollow`**, which work without JS. Filtered pages are `noindex,follow` with canonical → clean category, except an allowlist (`src/seo/indexable-filters.ts`). | SPEC §7.4. |
| 29 | 2026-10-20 | **robots.txt does NOT disallow facet params** (only `sort=`), departing from SPEC §8.2. | A disallowed URL can't show its `noindex`, and allow-listed filter pages must stay crawlable. Noindex + nofollow links do the job. |
| 30 | 2026-10-20 | **Every deployment is `noindex` + disallow-all unless `ALLOW_INDEXING=1`.** | The pitch build uses OzLED's real content and canonicals. It must never compete with the live site in Google. |
| 31 | 2026-10-20 | "Load more" appends pages client-side via `/api/listing`. Real `?page=N` links render underneath. Page 2+ is canonical to itself. | SPEC §7.4. Crawlable pagination. |
| 32 | 2026-10-20 | Empty categories return **404** (not 301) and are left out of sitemaps. | SPEC §8.3. A 301 target needs a human choice per category. Add to `redirects.json` as decided. |
| 33 | 2026-10-20 | Restricted items: "Request a quote" links to the live **trade registration form** with `?sku=`. Policy text is shown in the buy box. Kit builder and quick-add never add them. | SPEC §7.6 says to link the trade form. No dedicated quote form found on the live site. Note: the live site currently lets anyone add these to cart. |
| 34 | 2026-10-20 | Fleet quote form composes an **email** (mailto) to the sales inbox for now. | No Neto form endpoint confirmed. Nothing is lost. Swap to a Neto form post later. |
| 35 | 2026-10-20 | "You'll also need" and the kit builder show only **in-stock, buyable** compatible items first. Out-of-stock items can't be selected. Backordered items are never pre-selected. | SPEC §7.3 and §7.5. |
| 36 | 2026-10-20 | JSON-LD via one `<JsonLd>` component that escapes `<`. Builders emit only properties with real data (no rating without reviews). Return policy in the Product schema: 30 days (**VERIFY** against the returns policy). | Fixes the live site's unparseable JSON-LD. |
| 37 | 2026-10-20 | SEO audit as a crawler script (`scripts/audit.mjs`) run in CI against a production build: one H1, canonical, JSON-LD parses, alt text, zoom, no broken links or chains, title length. | SPEC §8.3: "each one is a test". |
| 38 | 2026-10-20 | Lighthouse CI on home, category and product (mobile). Fails below 95 performance/accessibility/SEO, LCP > 2 s, CLS > 0.05, JS > 120 KB, CSS > 40 KB, > 4 fonts. Used **instead of `size-limit`**. | LHCI measures the real transferred bytes per page, which is what the SPEC §11 budget is about. One less tool. |
| 39 | 2026-10-20 | `/_styleguide` lives at `app/(store)/%5Fstyleguide` (App Router treats `_folders` as private). Off in production unless `ENABLE_STYLEGUIDE=1`. | SPEC §10. |
| 40 | 2026-10-20 | Hub paths **`/ute-tray-lights/`** and **`/trailer-boat-lights/`** (checked against the live sitemap: no collisions). They link to the existing ranking categories rather than replacing them. | SPEC §7.2: don't cannibalise `/led-combination-tail-lights/` etc. Semrush check still to do. |
| 41 | 2026-10-20 | Reviews: real TrustSpot data only. Where it isn't publicly retrievable, the product shows "No reviews yet" with no rating and no `aggregateRating`. | Never fabricate reviews. |
| 42 | 2026-10-20 | `/llms.txt` generated from data (hubs, categories, guides, policies). AI crawlers allowed. | SPEC §9. Owner can flip this (§14.8). |

## Runtime dependencies

| Package | Why |
| --- | --- |
| `next`, `react`, `react-dom` | Framework (SPEC §3.3). |
| `zod` | Schema validation at the DataSource boundary (SPEC §3.3). |
| `server-only` | Build-time guard so data and Neto modules can never be bundled for the browser (SPEC §0.2). |

Dev only: `tailwindcss`, `typescript`, `eslint`, `vitest`, `@playwright/test`, `@lhci/cli`, `prettier`, `sharp` (fixture image processing).
