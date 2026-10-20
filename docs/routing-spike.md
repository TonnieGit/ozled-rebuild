# Routing spike (Phase 0)

**Question:** can the Next.js storefront and Neto share `www.ozled.com.au` (SPEC §3.1), or do we fall back to commerce on a subdomain (§3.2)?

**Status:** Not resolved. Findings below come from public, unauthenticated probes of the live site on 20 Oct 2026. The deciding test needs DNS access and an answer from Neto support (see "Blocking questions").

---

## 1. What the live site looks like today

| Fact | Evidence | Implication |
| --- | --- | --- |
| OzLED's DNS is on Cloudflare | `NS ozled.com.au` → `arya.ns.cloudflare.com`, `yichun.ns.cloudflare.com` | OzLED can add a Worker to its own zone, so the edge-router idea is possible in principle. |
| `www` is a **DNS-only** CNAME to Neto | Public resolution returns `www.ozled.com.au CNAME stores.neto.com.au` (a proxied record would hide the CNAME) | OzLED's Cloudflare is **not** in the request path today. |
| The edge that serves the site is **Neto's** Cloudflare | `stores.neto.com.au` resolves to `104.16.x`. Responses carry `Server: cloudflare`, `CF-RAY …-BNE`, `x-cache`, `_cfuvid` | Putting OzLED's Worker in front makes it Cloudflare-in-front-of-Cloudflare ("orange-to-orange", O2O). |
| Neto checks the hostname | `GET https://stores.neto.com.au/` with `Host: www.ozled.com.au` → **403** | A Worker can't just `fetch('https://stores.neto.com.au', {headers:{Host}})`. The request must reach Neto as `www.ozled.com.au`. |
| `/_mycart` is behind a Cloudflare managed challenge | Non-browser GET → **403 "Just a moment…"**, even with a session cookie | Neto's bot rules would challenge server-side fetches from a Worker or Next.js. Browser-originated requests passed through the proxy must still be able to solve the challenge. |
| Storefront AJAX lives under `/ajax/*` | `main.js` (`assets.netostatic.com/ecommerce/6.380.0/…`) posts to `/ajax/<fn>`: `addtocart`, `ajax_template`, `ajax_search`, `postcode_selector`, `variations`, `wishlist`, `notifyme` | `/ajax/*` must go to Neto. **It's missing from the SPEC §3.1 route list.** |
| Live cart is readable same-origin | `POST /ajax/addtocart` with `proc=ShowItem&csrf_token=…` → `^NETO^SUCCESS^NSD1;…` with `cartitems`, `item_count`, `grand_total`, `checkouturl` | Answers SPEC §6.1 step 2: the cart drawer can show live contents, **if** the pages are same-origin. |
| CSRF is enforced on AJAX | The first `ShowItem` without a token → `FAIL … Failed CSRF check`, and the response hands back a fresh `csrf_token` | The drawer flow is to request, take the token from the FAIL response, then retry. Neto's `main.js` also refreshes `NETO.csrfToken` from each response. |
| Account paths are inconsistent | Footer links use `/_myacct/*`, but also `/myacct/warranty` (no underscore) | Route `/myacct/*` to Neto too. |
| Session bootstrap | `GET /ajax/webshop_session_config` returns JS setting `webshopMainSessionId`, `shopperType` (`Guest`), `customerId` | Possible hook for the §6.3 stretch goal (detect a signed-in customer), but it's guest-only so far. |

## 2. Options

### Option A: same domain, Worker in front (SPEC §3.1, preferred)

Turn on Cloudflare proxying for `www` in OzLED's zone, then attach a Worker that sends commerce paths to the origin (Neto) and everything else to the storefront host.

- Depends on Neto's zone accepting O2O traffic for `www.ozled.com.au`. Cloudflare allows this when the SaaS provider onboarded the hostname as a **Cloudflare for SaaS custom hostname**. Otherwise you get error 1014 (CNAME cross-user banned) or a 403.
- Even if O2O works, check that Neto's challenge/WAF still sees the real visitor (IP, cookies), so challenges resolve in the shopper's browser and don't loop.
- Payment returns (Stripe is on the page, plus PayPal and Afterpay) come back to `www.ozled.com.au/…` paths that must reach Neto. Those paths are only known after a real test checkout.

### Option B: commerce on a subdomain (SPEC §3.2 fallback)

Neto moves to `shop.ozled.com.au`, and `www` points to the storefront.

- Cart contents can't be read from `www` (Neto's cookies are host-only, and CORS on `/ajax/*` is unknown and probably closed). Use the local bag and `multi=` hand-off (§6.2).
- Must VERIFY with Neto: changing the primary domain doesn't break order emails, gateway return URLs, Google Merchant feeds or saved customer sessions.
- SEO impact is low, since commerce paths are `Disallow`ed in robots.txt today.

### Option C: storefront proxies to Neto itself (rejected for now)

Next.js rewrites commerce paths to `stores.neto.com.au`. This fails on hostname validation (403), and server-side requests hit the cart challenge. Don't pursue it unless Neto offers a documented origin hostname.

## 3. Proposed Worker route table (Option A)

Commerce to Neto, everything else to the storefront. Redirects are served first (SPEC §8.1).

```
/_mycart*        /_myacct*      /myacct/*      /purchase*
/form/*          /do/*          /ajax/*        /assets/*
/_cpanel*        /cgi-bin/*     /sitemap_*.xml.gz (until replaced)
+ payment-callback paths discovered in test checkout
```

## 4. Blocking questions for Neto / Maropost support

1. Are custom domains onboarded as Cloudflare for SaaS custom hostnames, so a merchant can proxy `www` through their own Cloudflare zone (O2O)? Is that supported?
2. Is there a supported staging hostname we can point at the store for testing without moving production `www`?
3. What are the full gateway callback/return URL paths for Stripe, PayPal and Afterpay?
4. Can bot-challenge rules be relaxed for `/ajax/addtocart` and `/_mycart` for traffic arriving via the merchant's proxy?
5. If we fall back to Option B: is moving the store to `shop.ozled.com.au` supported, and what breaks?
6. Do `/ajax/*` endpoints send CORS headers, or can they be configured to?

## 5. Test plan (run once we have DNS access and a staging host)

- [ ] Create `staging.ozled.com.au` (or the Neto-provided equivalent), proxied in OzLED's zone, with the Worker attached.
- [ ] `GET /` through the Worker returns Neto's homepage (no 1014/403).
- [ ] `GET /_mycart` in a real browser passes any challenge and renders the cart.
- [ ] `POST /ajax/addtocart proc=AddItem` from a storefront page adds an item, and `ShowItem` reflects it.
- [ ] `/_mycart?multi=…&fn=payment` lands on checkout with every line.
- [ ] Test checkout with each gateway (Stripe card, PayPal, Afterpay) completes and returns to the order confirmation. Record every callback path.
- [ ] Order confirmation email links point to the right host.
- [ ] Sign in via `/_myacct`. Session persists across storefront and Neto pages.
- [ ] Worker adds < 20 ms p50 to storefront responses.

**Decision rule:** if any of the first four checks fail and Neto support can't fix it, choose Option B and record that in `docs/decisions.md`.

## 6. Done while waiting (portfolio mode)

The storefront is built against an abstract `CartClient` with two implementations:
- `neto-ajax`: same-origin `/ajax/addtocart` (`AddItem`, `AddMultiItems`, `ShowItem`, `RemoveItem`) and an `NSD1` response parser.
- `local-bag`: the §6.2 fallback.

In fixtures mode the cart uses `local-bag`, so the whole journey can be demoed without Neto.
