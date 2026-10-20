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

## Runtime dependencies

_None yet. Added in Phase 1 with justification._
