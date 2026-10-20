import { Icon, type IconName } from "@/components/icon";
import type { ProductSpecs, StockStatus } from "@/data/types";
import { cx, money, moneyParts, saving, voltageLabel } from "@/lib/format";

export function Price({ price, rrp, size = "md" }: { price: number; rrp?: number; size?: "md" | "lg" }) {
  const s = saving(price, rrp);
  const { dollars, cents } = moneyParts(price);
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <p className={cx("font-bold tracking-tight tabular-nums", size === "lg" ? "text-4xl" : "text-xl")}>
        <span className="sr-only">Price </span>
        <span aria-hidden>
          ${dollars}
          <span className={cx("align-top", size === "lg" ? "text-xl" : "text-sm")}>.{cents}</span>
        </span>
        <span className="sr-only">{money(price)}</span>
      </p>
      {s && rrp && (
        <p className={cx("text-fg-muted", size === "lg" ? "text-base" : "text-sm")}>
          <span className="line-through">RRP {money(rrp)}</span>{" "}
          <span className="font-semibold text-error">Save {money(s.amount)}</span>
        </p>
      )}
    </div>
  );
}

const STOCK: Record<StockStatus, { label: string; className: string }> = {
  in_stock: { label: "In stock", className: "text-success" },
  low: { label: "Low stock", className: "text-warning" },
  backorder: { label: "On backorder", className: "text-warning" },
  out: { label: "Out of stock", className: "text-fg-subtle" },
};

export function StockChip({ stock, className }: { stock: StockStatus; className?: string }) {
  const s = STOCK[stock];
  return (
    <p className={cx("inline-flex items-center gap-1.5 text-sm font-semibold", s.className, className)}>
      <span className="size-2 rounded-full bg-current" aria-hidden />
      {s.label}
    </p>
  );
}

export function stockLabel(stock: StockStatus) {
  return STOCK[stock].label;
}

/** Icon + value chips: 12–24V, IP67, ADR, 7-yr warranty (SPEC §10). */
export function specChips(specs: ProductSpecs): { icon: IconName; label: string; title: string }[] {
  const chips: { icon: IconName; label: string; title: string }[] = [];
  const v = voltageLabel(specs.voltage);
  if (v) chips.push({ icon: "bolt", label: v, title: "Voltage" });
  if (specs.ipRating) chips.push({ icon: "droplet", label: specs.ipRating, title: "Water and dust rating" });
  if (specs.adrApprovals?.length) chips.push({ icon: "shield", label: "ADR", title: "ADR approved" });
  if (specs.warrantyYears) chips.push({ icon: "clock", label: `${specs.warrantyYears}-yr`, title: `${specs.warrantyYears} year warranty` });
  if (specs.connector === "plug-and-play") chips.push({ icon: "plug", label: "Plug & play", title: "Plug and play connection" });
  return chips;
}

export function SpecChips({ specs, max = 4, size = "sm" }: { specs: ProductSpecs; max?: number; size?: "sm" | "md" }) {
  const chips = specChips(specs).slice(0, max);
  if (!chips.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Key specs">
      {chips.map((c) => (
        <li
          key={c.label}
          title={c.title}
          className={cx(
            "inline-flex items-center gap-1 rounded-sm border border-border bg-bg-subtle font-semibold text-fg-muted",
            size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
          )}
        >
          <Icon name={c.icon} size={size === "sm" ? 13 : 16} />
          <span>
            <span className="sr-only">{c.title}: </span>
            {c.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Rating({ average, count, size = "sm" }: { average: number; count: number; size?: "sm" | "md" }) {
  if (!count) return null;
  const pct = (average / 5) * 100;
  const px = size === "sm" ? 14 : 18;
  return (
    <p className="flex items-center gap-1.5 text-sm text-fg-muted">
      <span className="relative inline-flex" aria-hidden>
        <span className="flex text-border-strong">
          {[0, 1, 2, 3, 4].map((i) => (
            <Icon key={i} name="star" size={px} />
          ))}
        </span>
        <span className="absolute inset-0 flex overflow-hidden text-signal" style={{ width: `${pct}%` }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Icon key={i} name="star" size={px} className="shrink-0" />
          ))}
        </span>
      </span>
      <span>
        <span className="sr-only">Rated {average.toFixed(1)} out of 5 from </span>
        <span aria-hidden>{average.toFixed(1)} </span>({count}
        <span className="sr-only"> reviews</span>)
      </span>
    </p>
  );
}
