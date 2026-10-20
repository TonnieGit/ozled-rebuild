import { describe, expect, it } from "vitest";
import { pathToSlug, slugToPath, toggleSlash } from "../../src/lib/paths";

describe("legacy path round-trip", () => {
  const cases = [
    "/led-tail-lights/",
    "/led-autolamps-tail-light-maxilamp-3-series",
    "/automotive/led-tail-lights/sequential-led-tail-lights/",
    "/LED-Headlight-Conversions",
    "/~168198",
    "/universal-undercover-led-insert-light-colour-green~6497",
  ];
  for (const path of cases) {
    it(path, () => expect(slugToPath(pathToSlug(path))).toBe(path));
  }
  it("toggles the trailing slash", () => {
    expect(toggleSlash("/a/")).toBe("/a");
    expect(toggleSlash("/a")).toBe("/a/");
  });
});
