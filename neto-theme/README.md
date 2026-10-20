# Neto checkout re-skin (SPEC §6.4, Phase 4)

The one piece of Neto theme work in scope: make `/_mycart` and checkout look like the new storefront, so the seam is invisible.

**Status:** prepared, not applied. Needs Neto control-panel access (Settings & tools → Themes → OzLed2021 → files) and a staging theme copy.

## Plan

1. Duplicate the live `OzLed2021` theme as `OzLed2026` (never edit live).
2. Upload `oz-checkout.css` to `/assets/themes/OzLed2026/css/` and add it **last** in `templates/headers/template.html`.
3. Self-host the same fonts: upload the Barlow Condensed 800 italic and Inter woff2 files from the storefront build (`.next/static/media`) to `/assets/themes/OzLed2026/fonts/`.
4. Replace the header and footer includes in the cart/checkout templates (`templates/cart/*`, `templates/checkout/*`) with markup matching the storefront header (logo, phone, secure-checkout lock). No mega menu at checkout.
5. Remove from checkout templates: Podium, session recorders, popups (SPEC §7.9: never on cart or checkout).
6. Test: card, PayPal and Afterpay checkouts on the staging theme, mobile and desktop.

`oz-checkout.css` maps the storefront tokens onto Neto's Bootstrap-based checkout markup. Class names come from Neto's standard Skeletal templates. Verify them against OzLed2021's actual templates before applying.
