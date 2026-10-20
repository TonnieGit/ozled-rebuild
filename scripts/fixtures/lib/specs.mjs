// First-pass regex extraction of typed specs from free-text product copy.
// Output is a DRAFT: every product's specs are then reviewed by hand in data/products-curated.mjs.

const num = (s) => Number(String(s).replace(/,/g, ""));

export function extractSpecs(t) {
  const s = {};
  const extra = [];
  const text = t.replace(/ /g, " ");

  // Voltage
  let m = text.match(/(\d{1,2})\s*(?:-|to|–)\s*(\d{2})\s*(?:V\b|VDC|Volt|v\b|vdc)/i) || text.match(/multi\s*-?volt\s*(\d{1,2})\s*-\s*(\d{2})/i);
  if (m) s.voltage = { min: num(m[1]), max: num(m[2]) };
  else if ((m = text.match(/\b(12|24)\s*(?:V|Volt|volts)\b(?:\s*only)?/i))) s.voltage = { min: num(m[1]), max: num(m[1]) };

  // IP rating: keep the highest stated
  const ips = [...text.matchAll(/\bIP\s?([0-9X][0-9X])(K)?\b/gi)].map((x) => `IP${x[1].toUpperCase()}${x[2] ? "K" : ""}`);
  if (ips.length) {
    const rank = (r) => Number(r.replace(/\D/g, "") || 0) + (r.endsWith("K") ? 0.5 : 0);
    const uniq = [...new Set(ips)].sort((a, b) => rank(b) - rank(a));
    s.ipRating = uniq[0];
    if (uniq.length > 1) extra.push({ label: "Also rated", value: uniq.slice(1).join(", ") });
  }

  // Dimensions L x W x D in mm
  m = text.match(/(\d{2,4}(?:\.\d+)?)\s*(?:mm)?\s*[x×X]\s*(\d{1,4}(?:\.\d+)?)\s*(?:mm)?\s*[x×X]\s*(\d{1,4}(?:\.\d+)?)\s*mm/);
  if (m) s.dimensionsMm = { length: num(m[1]), width: num(m[2]), depth: num(m[3]) };

  // Warranty
  m = text.match(/(\d{1,2})[\s-]*years?['’]?\s*(?:warranty|warranties)/i) || text.match(/warranty[^.\n]{0,20}?(\d{1,2})\s*years?/i);
  if (m) s.warrantyYears = num(m[1]);
  else if (/lifetime (?:replacement )?warranty/i.test(text)) extra.push({ label: "Warranty", value: "Lifetime" });

  // LED count
  m = text.match(/\b(\d{1,3})\s*(?:x\s*)?(?:high[- ]intensity |square |smd |ultra-high intensity |genuine cree |osram )?LED'?s?\b/i);
  if (m) s.ledCount = num(m[1]);

  // Cable length
  m = text.match(/(\d{1,3})\s*cm\s*(?:of\s*)?(?:hard\s*wired\s*)?(?:cable|wire|lead)/i);
  if (m) s.cableLengthMm = num(m[1]) * 10;
  else if ((m = text.match(/cable length\s*(\d{2,4})\s*mm/i))) s.cableLengthMm = num(m[1]);

  // Wattage / lumens
  m = text.match(/\b(\d{1,3})\s*W(?:att)?\b(?!\s*LED)/);
  if (m) s.wattage = num(m[1]);
  m = text.match(/\b([\d,]{2,6})\s*(?:lm|LM|lumens|Lumens)\b/);
  if (m) s.lumens = num(m[1]);

  // ADR / ECE
  const adr = [];
  const crn = text.match(/CRN\s*(?:No\.?\s*)?([\d/ ]+)/i);
  if (/ADR\s*(?:\/ECE\s*)?(?:approved|compliant)|ADR approval/i.test(text) && !/non-ADR/i.test(text)) adr.push(crn ? `ADR approved (CRN ${crn[1].trim()})` : "ADR approved");
  if (adr.length) s.adrApprovals = adr;
  if (/\bECE\b/.test(text)) extra.push({ label: "Road approval", value: "ECE approved" });

  // Functions
  const f = new Set();
  if (/\bstop\b/i.test(text)) f.add("stop");
  if (/\btail\b/i.test(text)) f.add("tail");
  if (/\bind(icator)?\b/i.test(text)) f.add("indicator");
  if (/\brev(erse)?\b/i.test(text)) f.add("reverse");
  if (/licen[cs]e plate/i.test(text)) f.add("licence-plate");
  if (/reflector/i.test(text)) f.add("reflector");
  if (f.size) s.functions = [...f];

  // Mounting
  const mt = new Set();
  if (/surface mount/i.test(text)) mt.add("surface");
  if (/recess(ed)? mount|recessed/i.test(text)) mt.add("recessed");
  if (/horizontal(ly)?/i.test(text)) mt.add("horizontal");
  if (/vertical(ly)?/i.test(text)) mt.add("vertical");
  if (/flush mount/i.test(text)) mt.add("flush");
  if (/magnetic/i.test(text)) mt.add("magnetic");
  if (mt.size) s.mount = [...mt];

  // Connector
  if (/DT04|deutsch|DT plug/i.test(text)) s.connector = "deutsch";
  else if (/7 pin flat/i.test(text)) s.connector = "7-pin-flat";
  else if (/anderson/i.test(text)) s.connector = "anderson";

  // Beam
  if (/\bcombo\b/i.test(text)) s.beam = "combo";
  else if (/\bflood\b/i.test(text)) s.beam = "flood";
  else if (/\bspot\b/i.test(text)) s.beam = "spot";

  if (extra.length) s.extra = extra;
  return s;
}
