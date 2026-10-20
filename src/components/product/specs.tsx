import type { ProductSpecs } from "@/data/types";
import { FACETS } from "@/data/facets";
import { voltageLabel } from "@/lib/format";

const label = (key: keyof typeof FACETS, v: string) => FACETS[key].valueLabel(v);

/** Typed specs → labelled rows with units (SPEC §9: facts as structure). */
export function specRows(s: ProductSpecs): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  const v = voltageLabel(s.voltage);
  if (v) rows.push({ label: "Voltage", value: `${v} DC` });
  if (s.wattage) rows.push({ label: "Power", value: `${s.wattage} W` });
  if (s.lumens) rows.push({ label: "Light output", value: `${s.lumens.toLocaleString("en-AU")} lm` });
  if (s.ledCount) rows.push({ label: "LEDs", value: String(s.ledCount) });
  if (s.functions?.length) rows.push({ label: "Functions", value: s.functions.map((f) => label("functions", f)).join(", ") });
  if (s.beam) rows.push({ label: "Beam", value: s.beam[0].toUpperCase() + s.beam.slice(1) });
  if (s.lightColour) rows.push({ label: "Light colour", value: s.lightColour });
  if (s.lensColour) rows.push({ label: "Lens", value: s.lensColour });
  if (s.housing) rows.push({ label: "Housing", value: s.housing });
  if (s.ipRating) rows.push({ label: "Water/dust rating", value: s.ipRating });
  if (s.mount?.length) rows.push({ label: "Mounting", value: s.mount.map((m) => label("mount", m)).join(", ") });
  if (s.connector) rows.push({ label: "Connection", value: label("connector", s.connector) });
  if (s.cableLengthMm) rows.push({ label: "Cable length", value: `${s.cableLengthMm.toLocaleString("en-AU")} mm` });
  const d = s.dimensionsMm;
  if (d) {
    const parts = [d.length && `${d.length} L`, d.width && `${d.width} W`, d.depth && `${d.depth} D`, d.diameter && `Ø ${d.diameter}`].filter(Boolean);
    if (parts.length) rows.push({ label: "Dimensions", value: `${parts.join(" × ")} mm` });
  }
  if (s.adrApprovals?.length) rows.push({ label: "ADR approval", value: s.adrApprovals.join("; ") });
  if (s.warrantyYears) rows.push({ label: "Warranty", value: `${s.warrantyYears} year${s.warrantyYears === 1 ? "" : "s"}` });
  for (const e of s.extra ?? []) rows.push(e);
  return rows;
}

export function SpecsTable({ specs }: { specs: ProductSpecs }) {
  const rows = specRows(specs);
  if (!rows.length) return null;
  return (
    <dl className="grid overflow-hidden rounded-lg border border-border sm:grid-cols-2">
      {rows.map((r) => (
        <div key={r.label} className="flex justify-between gap-4 border-b border-border px-4 py-3 text-sm odd:bg-bg-subtle sm:[&:nth-child(4n+2)]:bg-bg-subtle sm:[&:nth-child(4n+3)]:bg-transparent">
          <dt className="text-fg-muted">{r.label}</dt>
          <dd className="text-right font-semibold">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
