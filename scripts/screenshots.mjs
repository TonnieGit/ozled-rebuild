#!/usr/bin/env node
/**
 * Visual review: full-page screenshots of key templates at phone and desktop widths.
 * Usage: node scripts/screenshots.mjs [baseUrl] [outDir]
 */
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const OUT = process.argv[3] ?? "screenshots";
const PAGES = (process.env.SHOT_PATHS ?? "/,/led-tail-lights/,/ute-tray-lights/").split(",");
const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const p of PAGES) {
    await page.goto(BASE + p, { waitUntil: "networkidle" });
    const name = p.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home";
    await page.screenshot({ path: `${OUT}/${name}-${vp.name}-fold.png` });
    await page.screenshot({ path: `${OUT}/${name}-${vp.name}-full.png`, fullPage: true });
  }
  await ctx.close();
}
await browser.close();
console.log(`Saved to ${OUT}/`);
