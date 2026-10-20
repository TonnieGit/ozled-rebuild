import { describe, expect, it } from "vitest";
import { prepare, search, type SearchDoc } from "../../src/lib/search";

const docs: SearchDoc[] = [
  { id: "1", type: "product", title: "Maxilamp 3 Series LED Combination Tail Light", path: "/a", keywords: "LED Autolamps LEDMAX3 tail lights stop indicator" },
  { id: "2", type: "product", title: "LED Licence Plate Light Chrome", path: "/b", keywords: "number plate rego" },
  { id: "3", type: "product", title: "32in LED Light Bar Combo Beam", path: "/c", keywords: "Roadvision driving" },
  { id: "4", type: "product", title: "7 Pin Flat Trailer Socket", path: "/d", keywords: "plug wiring" },
];
const index = prepare(docs);
const top = (q: string) => search(index, q)[0]?.doc.id;

describe("search", () => {
  it("matches exact names", () => expect(top("maxilamp 3")).toBe("1"));
  it("handles synonyms: taillight → tail light", () => expect(top("led taillight")).toBe("1"));
  it("handles synonyms: number plate → licence plate", () => expect(top("number plate light")).toBe("2"));
  it("handles synonyms: lightbar → light bar", () => expect(top("lightbar")).toBe("3"));
  it("tolerates typos", () => expect(top("maxilmap")).toBe("1"));
  it("matches SKUs in keywords", () => expect(top("ledmax3")).toBe("1"));
  it("requires every word to match", () => expect(search(index, "trailer socket chrome")).toHaveLength(0));
  it("returns nothing for empty queries", () => expect(search(index, "  ")).toHaveLength(0));
});
