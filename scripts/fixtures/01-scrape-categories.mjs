// Step 1: parse the live menu and fetch the category pages we need (page 1 only).
// Output: .cache/parsed/menu.json, .cache/parsed/category-pages.json
import fs from "node:fs";
import path from "node:path";
import { getText, ROOT, stats } from "./lib/fetch.mjs";
import { parseMenu, parseCategoryPage } from "./lib/parse.mjs";

export const CATEGORY_PAGES = [
  // top-level mapped groups
  "/led-tail-lights/", "/led-headlights", "/off-road-led-lights/", "/led-work-lights/",
  "/led-indicator-lights-and-bullbar-lamps/", "/emergency-led-warning-lights-vehicle-sirens/",
  "/leisure-led-lights/", "/automotive-accessories/", "/car-reverse-cameras/", "/base6/",
  // product sources
  "/plug-and-play-led-tail-lights/", "/led-combination-tail-lights/", "/single-function-led-tail-lights/",
  "/led-trailer-tail-lights/", "/led-tail-light-accessories-brackets/", "/trailer-led-lights/",
  "/led-licence-plate-lights/", "/led-lighting-plugs-and-sockets/", "/automotive/towing-gear/trailer-sockets-plugs/",
  "/led-light-bars-for-work-and-4x4-vehicles/", "/offroad-4wd-led-driving-lights/", "/AmberLEDLights",
  "/led-camping-lights/", "/warning-emergency/vehicle-packages/police-vehicle-kits/",
  "/warning-emergency/led-beacon-lights/", "/led-warning-light-bars/", "/base6/Light-Bars", "/base6/work-Lights",
  "/camping-outdoors/flexible-led-strips-and-accessories/", "/Licence-Plate-Accessories",
  "/automotive-led-marker-lights/", "/trailer-accessories/",
];

const outDir = path.join(ROOT, ".cache/parsed");
fs.mkdirSync(outDir, { recursive: true });
const home = (await getText("/")).body;
const menu = parseMenu(home);
fs.writeFileSync(path.join(outDir, "menu.json"), JSON.stringify(menu, null, 2));

const pages = {};
for (const p of CATEGORY_PAGES) {
  const r = await getText(p);
  const parsed = parseCategoryPage(r.body);
  pages[p] = { status: r.status, finalUrl: r.url, ...parsed };
  console.log(r.status, p, `${parsed.cards.length} cards, ${parsed.pageCount} pages`, parsed.h1);
}
fs.writeFileSync(path.join(outDir, "category-pages.json"), JSON.stringify(pages, null, 2));
console.error(stats);
