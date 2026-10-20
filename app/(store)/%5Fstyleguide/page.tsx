import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Icon, type IconName } from "@/components/icon";
import { Price, Rating, SpecChips, StockChip } from "@/components/product/bits";
import { ProductCard } from "@/components/product/product-card";
import { SpecsTable } from "@/components/product/specs";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FaqList } from "@/components/ui/faq-list";
import { data } from "@/data";
import type { StockStatus } from "@/data/types";

export const metadata: Metadata = { title: { absolute: "Style guide | OzLED" }, robots: { index: false, follow: false } };

const SWATCHES: [string, string][] = [
  ["bg", "--oz-color-bg"],
  ["bg-subtle", "--oz-color-bg-subtle"],
  ["bg-muted", "--oz-color-bg-muted"],
  ["surface", "--oz-color-surface"],
  ["fg", "--oz-color-fg"],
  ["fg-muted", "--oz-color-fg-muted"],
  ["fg-subtle", "--oz-color-fg-subtle"],
  ["border", "--oz-color-border"],
  ["border-strong", "--oz-color-border-strong"],
  ["brand", "--oz-color-brand"],
  ["action", "--oz-color-action"],
  ["action-hover", "--oz-color-action-hover"],
  ["link", "--oz-color-link"],
  ["signal", "--oz-color-signal"],
  ["signal-fg", "--oz-color-signal-fg"],
  ["success", "--oz-color-success"],
  ["warning", "--oz-color-warning"],
  ["error", "--oz-color-error"],
  ["chrome", "--oz-color-chrome"],
  ["chrome-raised", "--oz-color-chrome-raised"],
];
const NEUTRALS = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const TYPE = [
  ["d5", "text-d5"],
  ["d4", "text-d4"],
  ["d3", "text-d3"],
  ["d2", "text-d2"],
] as const;
const SPACE = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24];
const ICONS: IconName[] = ["search", "cart", "user", "menu", "close", "chevronDown", "chevronRight", "check", "truck", "store", "bolt", "droplet", "shield", "clock", "download", "play", "star", "plus", "minus", "filter", "phone", "file", "info", "lock", "ruler", "plug", "sun", "wrench", "arrowRight", "external"];

/** Component gallery (SPEC §10). noindex; off in production unless ENABLE_STYLEGUIDE=1. */
export default async function StyleGuide() {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_STYLEGUIDE !== "1") notFound();
  const best = await data.listProducts({ pageSize: 4 });
  const restricted = (await data.listProducts({ pageSize: 200 })).items.find((c) => c.restricted);
  const sample = best.items[0] ? await data.getProductBySku(best.items[0].sku) : null;

  const block = (title: string, children: React.ReactNode) => (
    <section className="border-t border-border py-10">
      <h2 className="eyebrow mb-5 text-fg-muted">{title}</h2>
      {children}
    </section>
  );

  return (
    <div className="container-x py-10">
      <h1 className="display text-d4">Style guide</h1>
      <p className="mt-2 text-fg-muted">Tokens live in src/styles/tokens.css. Toggle your OS dark mode to check both themes.</p>

      {block(
        "Semantic colours",
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {SWATCHES.map(([name, v]) => (
            <li key={name} className="overflow-hidden rounded-lg border border-border">
              <div className="h-16" style={{ background: `var(${v})` }} />
              <p className="px-3 py-2 text-sm font-medium">{name}</p>
            </li>
          ))}
        </ul>,
      )}

      {block(
        "Neutral scale + brand",
        <div className="flex flex-wrap gap-1">
          {NEUTRALS.map((n) => (
            <div key={n} className="w-16 text-center text-xs">
              <div className="h-12 rounded-md border border-border" style={{ background: `var(--neutral-${n})` }} />
              {n}
            </div>
          ))}
          {["red-400", "red-500", "red-600", "red-700", "amber-400", "amber-700"].map((c) => (
            <div key={c} className="w-16 text-center text-xs">
              <div className="h-12 rounded-md" style={{ background: `var(--${c})` }} />
              {c}
            </div>
          ))}
        </div>,
      )}

      {block(
        "Type",
        <div className="space-y-4">
          {TYPE.map(([label, cls]) => (
            <p key={label} className={`display ${cls}`}>
              {label} · LED tail lights
            </p>
          ))}
          <p className="text-xl font-bold">Heading sans · Maxilamp 3 Series combination tail light</p>
          <p className="max-w-2xl">Body · Inter at 16px with 1.55 line height. Every product page leads with a 40–60 word answer-first summary that answer engines can quote.</p>
          <p className="text-sm text-fg-muted">Small muted · Shipping, trade and member pricing calculated at checkout.</p>
          <p className="sku">Mono · SKU LEDMAXILAMPC3XR</p>
          <p className="eyebrow text-action">Eyebrow label</p>
        </div>,
      )}

      {block(
        "Spacing (4-pt)",
        <ul className="space-y-1">
          {SPACE.map((s) => (
            <li key={s} className="flex items-center gap-3 text-xs">
              <span className="w-16 text-fg-muted">space-{s}</span>
              <span className="h-3 rounded-sm bg-action" style={{ width: `var(--oz-space-${s})` }} />
            </li>
          ))}
        </ul>,
      )}

      {block(
        "Radii & shadows",
        <div className="flex flex-wrap gap-6">
          {["sm", "md", "lg"].map((r) => (
            <div key={r} className="grid size-24 place-items-center border border-border-strong bg-bg-subtle text-xs" style={{ borderRadius: `var(--oz-radius-${r})` }}>
              radius-{r}
            </div>
          ))}
          {["sm", "md", "lg"].map((s) => (
            <div key={s} className="grid size-24 place-items-center rounded-lg bg-surface text-xs" style={{ boxShadow: `var(--oz-shadow-${s})` }}>
              shadow-{s}
            </div>
          ))}
        </div>,
      )}

      {block(
        "Buttons",
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="h-12 rounded-md bg-action px-6 font-semibold text-action-fg hover:bg-action-hover">
            Primary
          </button>
          <button type="button" disabled className="h-12 rounded-md bg-action px-6 font-semibold text-action-fg opacity-50">
            Disabled
          </button>
          <button type="button" className="h-12 rounded-md border-2 border-fg px-6 font-semibold hover:bg-fg hover:text-bg">
            Secondary
          </button>
          <button type="button" className="h-11 rounded-md border border-border-strong px-5 font-semibold hover:bg-bg-muted">
            Tertiary
          </button>
          <a href="#" className="font-semibold text-link underline">
            Text link
          </a>
          <button type="button" className="tap grid place-items-center rounded-md hover:bg-bg-muted">
            <Icon name="close" label="Icon button" />
          </button>
        </div>,
      )}

      {block(
        "Icons",
        <ul className="flex flex-wrap gap-4">
          {ICONS.map((i) => (
            <li key={i} className="flex w-20 flex-col items-center gap-1 text-xs text-fg-muted">
              <Icon name={i} size={24} className="text-fg" />
              {i}
            </li>
          ))}
        </ul>,
      )}

      {block(
        "Commerce atoms",
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Price price={119.95} rrp={149.95} size="lg" />
            <Price price={34.5} />
            <div className="flex flex-wrap gap-4">
              {(["in_stock", "low", "backorder", "out"] as StockStatus[]).map((s) => (
                <StockChip key={s} stock={s} />
              ))}
            </div>
            <Rating average={4.6} count={128} size="md" />
            <SpecChips specs={{ voltage: { min: 12, max: 24 }, ipRating: "IP67", adrApprovals: ["ADR 6/00"], warrantyYears: 7, connector: "plug-and-play" }} max={5} size="md" />
          </div>
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Tail Lights", path: "/led-tail-lights/" },
              { name: "Maxilamp 3", path: "/led-autolamps-tail-light-maxilamp-3-series" },
            ]}
          />
        </div>,
      )}

      {block(
        "Product cards (in stock, sale, restricted)",
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...best.items.slice(0, 3), ...(restricted ? [restricted] : [])].map((c) => (
            <li key={c.sku}>
              <ProductCard card={c} />
            </li>
          ))}
        </ul>,
      )}

      {sample && block("Specs table", <SpecsTable specs={sample.specs} />)}

      {block(
        "FAQ",
        <FaqList
          faqs={[
            { question: "Are these lights ADR approved?", answer: "Yes. The approval numbers are listed in the specs table." },
            { question: "Will they run on 24V?", answer: "Multi-volt lights run on 12V and 24V systems." },
          ]}
        />,
      )}
    </div>
  );
}
