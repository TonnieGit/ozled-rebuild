/**
 * Small in-process product search (SPEC §7.8) with synonyms and typo tolerance.
 * Good for the fixtures catalogue and as a fallback; swap for Typesense/Meilisearch
 * behind the same function signature once the full catalogue is live.
 */

export interface SearchDoc {
  id: string;
  type: "product" | "category" | "guide" | "hub";
  title: string;
  path: string;
  /** Extra text that should match but weigh less (brand, SKU, category names, specs). */
  keywords: string;
  boost?: number;
}

export interface SearchHit<T extends SearchDoc = SearchDoc> {
  doc: T;
  score: number;
}

/** Each group is treated as equivalent terms. */
const SYNONYMS: string[][] = [
  ["tail light", "taillight", "tail lamp", "taillamp", "rear light", "stop tail"],
  ["number plate", "licence plate", "license plate", "rego light", "plate light"],
  ["light bar", "lightbar", "led bar", "bar light"],
  ["work light", "worklight", "flood light", "floodlight"],
  ["beacon", "strobe", "flashing light", "warning light"],
  ["indicator", "blinker", "turn signal"],
  ["plug", "socket", "connector", "trailer plug"],
  ["reverse", "reversing", "backup"],
  ["ute", "tray", "tray back", "trayback", "tub"],
  ["camping", "camp", "awning"],
  ["driving light", "spotlight", "spot light"],
];

export function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9.]+/g, " ")
    .trim();
}

function expand(query: string): string[] {
  const q = normalise(query);
  const variants = new Set([q]);
  for (const group of SYNONYMS) {
    for (const term of group) {
      if (q.includes(term)) for (const alt of group) variants.add(q.replace(term, alt));
    }
  }
  return [...variants];
}

/** Optimal-string-alignment distance, capped for speed. */
function distance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      rowMin = Math.min(rowMin, d[i][j]);
    }
    if (rowMin > max) return max + 1;
  }
  return d[a.length][b.length];
}

function tokenScore(token: string, words: string[]): number {
  let best = 0;
  for (const w of words) {
    if (w === token) return 1;
    if (w.startsWith(token) && token.length >= 2) best = Math.max(best, 0.8);
    else if (token.length >= 4) {
      const allowed = token.length >= 7 ? 2 : 1;
      const dist = distance(token, w.slice(0, token.length + allowed), allowed);
      if (dist <= allowed) best = Math.max(best, 0.6 - 0.15 * dist);
    }
  }
  return best;
}

export interface PreparedDoc<T extends SearchDoc> {
  doc: T;
  titleWords: string[];
  keywordWords: string[];
  titleNorm: string;
}

export function prepare<T extends SearchDoc>(docs: T[]): PreparedDoc<T>[] {
  return docs.map((doc) => {
    const titleNorm = normalise(doc.title);
    return { doc, titleNorm, titleWords: titleNorm.split(" "), keywordWords: normalise(doc.keywords).split(" ") };
  });
}

export function search<T extends SearchDoc>(index: PreparedDoc<T>[], query: string, limit = 20): SearchHit<T>[] {
  const variants = expand(query).filter(Boolean);
  if (!variants.length) return [];
  const hits: SearchHit<T>[] = [];
  for (const p of index) {
    let best = 0;
    for (const v of variants) {
      const tokens = v.split(" ").filter(Boolean);
      let total = 0;
      let matched = 0;
      for (const t of tokens) {
        const s = Math.max(tokenScore(t, p.titleWords) * 1.0, tokenScore(t, p.keywordWords) * 0.7);
        if (s > 0) matched++;
        total += s;
      }
      // Every token must match something; phrase match in the title gets a bonus.
      if (matched < tokens.length) continue;
      let score = total / tokens.length;
      if (p.titleNorm.includes(v)) score += 0.5;
      best = Math.max(best, score);
    }
    if (best > 0) hits.push({ doc: p.doc, score: best * (p.doc.boost ?? 1) });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
