# Fixture scraper

Builds the portfolio-mode data in `src/data/fixtures/` (and images in `public/images/`) from the live
www.ozled.com.au store. Dev-only tooling: plain Node ESM, no extra dependencies (uses `sharp`).

## Rerun

```sh
node scripts/fixtures/build-all.mjs                      # fetches only what isn't cached yet
FIXTURES_OFFLINE=1 node scripts/fixtures/build-all.mjs   # cache only, no network
pnpm exec vitest run tests/unit/fixtures.test.ts         # validate
```

Every HTTP response is cached in `.cache/` (git-ignored), so reruns don't touch the live site.
Delete a file in `.cache/html/` (or the whole folder) to re-fetch. Fetching is sequential at
about 1 request per second (robots.txt `Crawl-delay: 1`) with a browser User-Agent, GET/HEAD only.
`/_mycart`, `/_myacct`, `/do/` and `/ajax/` are refused by the fetcher.

## Steps

| Script | What it does |
| --- | --- |
| `01-scrape-categories.mjs` | Parses the menu and fetches page 1 of the category pages we need |
| `02-scrape-products.mjs` | Fetches and parses each page in `data/product-list.mjs` |
| `03-product-images.mjs` | Downloads up to 6 images per product → WebP (1200px, q80) |
| `04-check-documents.mjs` | HEADs every datasheet/instruction link for size and 404s |
| `05-build-catalog.mjs` | Writes `categories.json` and `products.json` |
| `06-build-content.mjs` | Writes hubs, kits, banners, posts, content, site and redirects |

## Hand-reviewed data (edit these, then rerun)

- `data/categories.mjs`: the category tree (live paths), intros, SEO and FAQs. `data/category-bodies.mjs`: long copy.
- `data/products-curated.mjs`: per-product typed specs, features, summary, SEO, image views, documents,
  compatibility. Specs were extracted with a regex pass (`lib/specs.mjs`) and then checked by hand
  against each page. Only values stated on the page are included.
- `data/descriptions.mjs`: hand-cleaned descriptions for pages whose markup is too messy to clean by rule.
- `data/hubs-kits.mjs`: application hubs and kits.

`get.mjs` and `dump.mjs` are small helpers for inspecting a cached page.
