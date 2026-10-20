import { expect, test } from "@playwright/test";
import products from "../../src/data/fixtures/products.json" with { type: "json" };
import hubs from "../../src/data/fixtures/hubs.json" with { type: "json" };

type P = { path: string; restricted: boolean; stock: string };
const restricted = (products as P[]).find((p) => p.restricted)!;
const buyable = (products as P[]).find((p) => !p.restricted && p.stock === "in_stock")!;
const trayHub = (hubs as { path: string; application: string; featuredKitPath?: string }[]).find((h) => h.application === "ute-tray")!;

test.describe("SPEC §12 Phase 3 checks", () => {
  test("build a tray kit and reach checkout in under 2 minutes", async ({ page }) => {
    const started = Date.now();
    await page.goto(trayHub.path);
    await page.getByRole("link", { name: /start building|build your/i }).first().click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Walk every step: pick the first in-stock option, or skip optional steps.
    for (let guard = 0; guard < 8; guard++) {
      if (await page.getByRole("heading", { name: "Review your kit" }).isVisible()) break;
      const option = page.locator("[aria-pressed]:not([disabled])").first();
      if (await option.count()) await option.click();
      await page.getByRole("button", { name: /^(Next|Skip this step)/ }).click();
    }
    await expect(page.getByRole("heading", { name: "Review your kit" })).toBeVisible();
    await page.getByRole("button", { name: "Add kit to cart" }).click();

    const drawer = page.getByRole("dialog", { name: /your cart/i });
    await expect(drawer).toBeVisible();
    const checkout = drawer.getByRole("link", { name: /secure checkout/i });
    await expect(checkout).toHaveAttribute("href", /\/_mycart\?multi=\d+&sku0=.+&fn=payment/);
    expect(Date.now() - started).toBeLessThan(120_000);
  });

  test("restricted products cannot be added to cart", async ({ page }) => {
    await page.goto(restricted.path);
    await expect(page.getByRole("link", { name: "Request a quote" })).toBeVisible();
    await expect(page.getByRole("button", { name: /add to cart/i })).toHaveCount(0);
  });

  test("add to cart opens the drawer with the line", async ({ page }) => {
    await page.goto(buyable.path);
    await page.getByRole("button", { name: /^add to cart$/i }).first().click();
    const drawer = page.getByRole("dialog", { name: /your cart/i });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText("Subtotal")).toBeVisible();
  });
});

test.describe("SPEC §12 Phase 2 checks", () => {
  test("first product row is above the fold on a category", async ({ page }) => {
    await page.goto("/led-tail-lights/");
    const first = page.locator("main ul li article").first();
    await expect(first).toBeVisible();
    const box = await first.boundingBox();
    const vp = page.viewportSize()!;
    expect(box!.y).toBeLessThan(vp.height);
  });

  test("keyboard-only: open and close the product menu", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop mega menu");
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Shop by product" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveAttribute("href", /\//);
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
  });

  test("filters update the URL; filtered URLs are noindex", async ({ page, request }) => {
    await page.goto("/led-tail-lights/");
    if (await page.getByRole("button", { name: /^Filters/ }).isVisible()) await page.getByRole("button", { name: /^Filters/ }).click();
    const option = page.getByRole("checkbox").first();
    test.skip((await option.count()) === 0, "no facets");
    await option.click();
    await expect(page).toHaveURL(/\?.+=/);
    const res = await request.get(page.url());
    expect(res.headers()["x-robots-tag"]).toMatch(/noindex/);
  });

  test("unknown URLs return a real 404", async ({ request }) => {
    const res = await request.get("/this-page-does-not-exist-ozled");
    expect(res.status()).toBe(404);
  });

  test("trailing-slash variant redirects in one hop", async ({ request }) => {
    const res = await request.get("/led-tail-lights", { maxRedirects: 0 });
    expect([301, 308]).toContain(res.status());
    expect(res.headers()["location"]).toMatch(/\/led-tail-lights\/$/);
  });
});
