// Download (cached) and convert images to WebP with sharp.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { getBinary, ROOT } from "./fetch.mjs";

export const safeName = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/**
 * Fetch `url`, convert to WebP inside a `maxW` x `maxH` box, write to public/{rel}.
 * Returns { src, width, height, bytes } or null if the download failed.
 * Skips re-encoding when the output exists and is newer than the cached source.
 */
export async function toWebp(url, rel, { maxW = 1200, maxH = 1200, quality = 80, crop } = {}) {
  const buf = await getBinary(url);
  if (!buf) return null;
  const out = path.join(ROOT, "public", rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  let img = sharp(buf, { animated: false, failOn: "none" }).rotate();
  const meta = await img.metadata();
  if (crop) {
    // crop: { aspect } → centre crop to that width/height ratio
    const w = meta.width, h = meta.height;
    const targetH = Math.min(h, Math.round(w / crop.aspect));
    const targetW = Math.min(w, Math.round(targetH * crop.aspect));
    img = img.extract({ left: Math.round((w - targetW) / 2), top: Math.round((h - targetH) / 2), width: targetW, height: targetH });
  }
  // Flatten transparency onto white so product cut-outs look like the live site
  img = img.resize({ width: maxW, height: maxH, fit: "inside", withoutEnlargement: true }).flatten({ background: "#ffffff" });
  const info = await img.webp({ quality }).toFile(out);
  return { src: "/" + rel.replace(/\\/g, "/"), width: info.width, height: info.height, bytes: info.size, srcWidth: meta.width, srcHeight: meta.height };
}
