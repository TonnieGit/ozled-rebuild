# OzLED storefront

Headless storefront for [ozled.com.au](https://www.ozled.com.au). Neto by Maropost stays the commerce back end. See [SPEC.md](SPEC.md) for the full brief and [docs/decisions.md](docs/decisions.md) for every call made along the way.

## Run it

```bash
corepack enable pnpm   # once
pnpm install
cp .env.example .env.local
pnpm dev               # http://localhost:3000
```

It runs fully standalone on fixtures (`DATA_SOURCE=fixtures`): a real slice of OzLED's catalogue scraped from the public site, with structured specs and documents. No Neto credentials needed.

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server |
| `pnpm build && pnpm start` | Production build and server |
| `pnpm check` | Lint, typecheck, unit tests |
| `pnpm seo-audit [url]` | Crawls a running build and enforces SPEC §8.3 (one H1, canonicals, JSON-LD, alt text, zoom, no broken links) |
| `pnpm exec playwright test` | E2E journeys (kit to checkout, restricted items, filters, keyboard nav) |
| `pnpm lhci` | Lighthouse CI against the SPEC §11 budgets |

`/_styleguide` shows every token and component (dev only, or set `ENABLE_STYLEGUIDE=1`).

## How it fits together

```
app/(store)/[...slug]/page.tsx   one route → category | product | hub | kit | content | post
src/components/views/            one template per page type (no per-product pages)
src/data/                        DataSource interface, Zod schemas, facets
  fixtures/                      JSON catalogue + images (public/images)
  neto/                          Neto API adapter (Phase 4, untested until API access)
  memory.ts                      shared in-memory source used by both
src/lib/cart/                    CartClient: local bag (now) or Neto same-origin AJAX (later)
proxy.ts                         legacy redirects + exact trailing-slash handling
edge/worker.ts                   Cloudflare same-domain router (not deployed)
scripts/audit.mjs                SPEC §8.3 checks as a crawler
```

## Deploying (Vercel)

Import the GitHub repo in Vercel. Defaults work. Set these environment variables:

```
DATA_SOURCE=fixtures
NEXT_PUBLIC_CART_MODE=local
NEXT_PUBLIC_COMMERCE_ORIGIN=https://www.ozled.com.au
NEXT_PUBLIC_SITE_URL=https://www.ozled.com.au
ENABLE_STYLEGUIDE=1            # optional, for the pitch
```

Canonicals point at `www.ozled.com.au` on purpose. Every deployment sends `X-Robots-Tag: noindex` and a disallow-all robots.txt **unless `ALLOW_INDEXING=1`**, so the pitch build can never be indexed next to the live site. Set it only at launch.
