"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { Icon } from "@/components/icon";
import { SpecChips, StockChip } from "@/components/product/bits";
import { FACETS } from "@/data/facets";
import type { Kit, ProductCard } from "@/data/types";
import { cx, money } from "@/lib/format";

export interface KitCandidate extends ProductCard {
  compatibleWith: string[];
}

type Choice = { sku: string; qty: number } | null;

const buyable = (c: ProductCard) => (c.stock === "in_stock" || c.stock === "low") && !c.restricted;

/**
 * Step-through kit builder (SPEC §7.3). Later steps narrow to items compatible with
 * earlier picks; out-of-stock/backordered items are never pre-selected and show
 * their status; the whole kit goes to the cart in one multi-line request.
 */
export function KitBuilder({ kit, candidates }: { kit: Kit; candidates: Record<string, KitCandidate> }) {
  const { add, busy } = useCart();
  const [step, setStep] = useState(0);
  const [choices, setChoices] = useState<Choice[]>(() => kit.steps.map(() => null));
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showAll, setShowAll] = useState(false);
  const reviewIndex = kit.steps.length;
  const current = kit.steps[step];

  const compatibleSet = useMemo(() => {
    const set = new Set<string>();
    choices.slice(0, step).forEach((c) => c && candidates[c.sku]?.compatibleWith.forEach((s) => set.add(s)));
    return set;
  }, [choices, step, candidates]);

  const options = useMemo(() => {
    if (!current) return { list: [] as KitCandidate[], narrowed: false, hasCompatible: false };
    let list = current.candidateSkus.map((s) => candidates[s]).filter(Boolean);
    const compatible = list.filter((c) => compatibleSet.has(c.sku));
    const narrowed = step > 0 && compatible.length > 0 && !showAll;
    if (narrowed) list = compatible;
    for (const [key, value] of Object.entries(filters)) {
      if (!value || !FACETS[key]) continue;
      list = list.filter((c) => FACETS[key].values(c).includes(value));
    }
    // In-stock first, then best price.
    return { list: [...list].sort((a, b) => Number(buyable(b)) - Number(buyable(a)) || a.price - b.price), narrowed, hasCompatible: compatible.length > 0 };
  }, [current, candidates, compatibleSet, filters, showAll, step]);

  const filterOptions = useMemo(() => {
    if (!current) return [];
    const pool = current.candidateSkus.map((s) => candidates[s]).filter(Boolean);
    return current.filterKeys
      .filter((k) => FACETS[k])
      .map((k) => {
        const values = [...new Set(pool.flatMap((c) => FACETS[k].values(c)))];
        return { key: k, label: FACETS[k].label, values: values.map((v) => ({ value: v, label: FACETS[k].valueLabel(v) })) };
      })
      .filter((f) => f.values.length > 1);
  }, [current, candidates]);

  const lines = choices.flatMap((c) => (c ? [{ card: candidates[c.sku], qty: c.qty }] : [])).filter((l) => l.card);
  const total = lines.reduce((n, l) => n + l.card.price * l.qty, 0);

  const goTo = (i: number) => {
    setStep(i);
    setFilters({});
    setShowAll(false);
    document.getElementById("kit-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const choose = (sku: string) =>
    setChoices((prev) => prev.map((c, i) => (i === step ? (c?.sku === sku ? null : { sku, qty: current.defaultQty }) : c)));

  const stepDone = (i: number) => Boolean(choices[i]) || !kit.steps[i].required;
  const canReview = kit.steps.every((_, i) => stepDone(i));

  return (
    <div id="kit-top" className="scroll-mt-28">
      <ol className="flex gap-1 overflow-x-auto" aria-label="Kit steps">
        {[...kit.steps.map((s) => s.title), "Review"].map((title, i) => (
          <li key={title} className="min-w-28 flex-1">
            <button
              type="button"
              onClick={() => (i < reviewIndex || canReview ? goTo(i) : undefined)}
              aria-current={i === step ? "step" : undefined}
              disabled={i === reviewIndex && !canReview}
              className={cx(
                "w-full border-t-4 pt-2 text-left text-sm disabled:cursor-not-allowed",
                i === step ? "border-action font-semibold" : i < reviewIndex && choices[i] ? "border-fg text-fg" : "border-border text-fg-muted",
              )}
            >
              <span className="block text-xs text-fg-subtle">Step {i + 1}</span>
              {title}
              {i < reviewIndex && choices[i] && <Icon name="check" size={14} className="ml-1 inline text-success" />}
            </button>
          </li>
        ))}
      </ol>

      {current ? (
        <section aria-labelledby="step-h" className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="step-h" className="display text-d3">
                {current.title}
              </h2>
              <p className="mt-1 max-w-2xl text-fg-muted">{current.description}</p>
            </div>
            {!current.required && <span className="rounded-sm bg-bg-muted px-2 py-1 text-sm font-medium text-fg-muted">Optional</span>}
          </div>

          {(filterOptions.length > 0 || options.hasCompatible) && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {filterOptions.map((f) => (
                <label key={f.key} className="flex items-center gap-2 text-sm">
                  <span className="text-fg-muted">{f.label}</span>
                  <select
                    value={filters[f.key] ?? ""}
                    onChange={(e) => setFilters((x) => ({ ...x, [f.key]: e.target.value }))}
                    className="h-10 rounded-md border border-border-strong bg-surface px-2"
                  >
                    <option value="">Any</option>
                    {f.values.map((v) => (
                      <option key={v.value} value={v.value}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
              {step > 0 && options.hasCompatible && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!showAll} onChange={(e) => setShowAll(!e.target.checked)} className="size-4 accent-[var(--oz-color-action)]" />
                  Only show items that suit my picks
                </label>
              )}
            </div>
          )}

          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {options.list.map((c) => {
              const selected = choices[step]?.sku === c.sku;
              const disabled = c.stock === "out" || c.restricted;
              return (
                <li key={c.sku}>
                  <button
                    type="button"
                    onClick={() => !disabled && choose(c.sku)}
                    aria-pressed={selected}
                    disabled={disabled}
                    className={cx(
                      "flex h-full w-full gap-3 rounded-lg border-2 p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                      selected ? "border-action bg-action/5" : "border-border hover:border-border-strong",
                    )}
                  >
                    <span className="relative size-20 shrink-0 overflow-hidden rounded-md bg-bg-subtle">
                      <Image src={c.images[0].src} alt={c.images[0].alt} fill sizes="80px" className="object-contain p-1" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="line-clamp-2 text-sm font-semibold">{c.name}</span>
                      <SpecChips specs={c.specs} max={3} />
                      <span className="mt-auto flex items-center justify-between gap-2">
                        <span className="font-bold tabular-nums">
                          {money(c.price)}
                          {current.defaultQty > 1 && <span className="text-xs font-normal text-fg-muted"> ea × {current.defaultQty}</span>}
                        </span>
                        <StockChip stock={c.stock} className="text-xs" />
                      </span>
                    </span>
                    <span className={cx("grid size-6 shrink-0 place-items-center rounded-full border-2", selected ? "border-action bg-action text-white" : "border-border-strong")} aria-hidden>
                      {selected && <Icon name="check" size={14} />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {options.list.length === 0 && <p className="mt-6 text-fg-muted">Nothing matches those filters. Try “Any”.</p>}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
            <button type="button" onClick={() => goTo(Math.max(0, step - 1))} disabled={step === 0} className="h-12 rounded-md px-4 font-semibold text-fg-muted hover:bg-bg-muted disabled:invisible">
              <Icon name="chevronLeft" size={18} className="mr-1 inline" /> Back
            </button>
            <p className="text-sm text-fg-muted">
              Kit so far: <strong className="text-fg tabular-nums">{money(total)}</strong>
            </p>
            <button
              type="button"
              onClick={() => goTo(step + 1)}
              disabled={current.required && !choices[step]}
              className="h-12 rounded-md bg-action px-6 font-semibold text-action-fg hover:bg-action-hover disabled:opacity-50"
            >
              {choices[step] ? "Next" : current.required ? "Choose one to continue" : "Skip this step"}
              <Icon name="chevronRight" size={18} className="ml-1 inline" />
            </button>
          </div>
        </section>
      ) : (
        <section aria-labelledby="review-h" className="mt-8">
          <h2 id="review-h" className="display text-d3">
            Review your kit
          </h2>
          <ul className="mt-5 divide-y divide-border rounded-lg border border-border">
            {kit.steps.map((s, i) => {
              const c = choices[i];
              const card = c ? candidates[c.sku] : null;
              return (
                <li key={s.id} className="flex items-center gap-4 p-4">
                  {card ? (
                    <>
                      <span className="relative size-16 shrink-0 overflow-hidden rounded-md bg-bg-subtle">
                        <Image src={card.images[0].src} alt={card.images[0].alt} fill sizes="64px" className="object-contain p-1" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs text-fg-subtle">{s.title}</span>
                        <Link href={card.path} className="line-clamp-2 font-semibold hover:underline">
                          {card.name}
                        </Link>
                        <StockChip stock={card.stock} className="text-xs" />
                      </span>
                      <span className="text-right">
                        <span className="block text-sm text-fg-muted">× {c!.qty}</span>
                        <span className="font-bold tabular-nums">{money(card.price * c!.qty)}</span>
                      </span>
                    </>
                  ) : (
                    <span className="flex-1 text-sm text-fg-muted">
                      {s.title}: skipped
                    </span>
                  )}
                  <button type="button" onClick={() => goTo(i)} className="text-sm font-semibold text-link underline">
                    Change
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 flex flex-col items-end gap-3">
            <p className="text-lg">
              Kit total <strong className="ml-2 text-2xl tabular-nums">{money(total)}</strong>
            </p>
            <button
              type="button"
              disabled={busy || lines.length === 0}
              onClick={() => add(lines.map((l) => ({ sku: l.card.sku, name: l.card.name, qty: l.qty, price: l.card.price, image: l.card.images[0]?.src, path: l.card.path })))}
              className="flex h-12 items-center gap-2 rounded-md bg-action px-8 font-semibold text-action-fg hover:bg-action-hover disabled:opacity-50"
            >
              <Icon name="cart" size={20} /> Add kit to cart
            </button>
            <p className="text-sm text-fg-muted">All {lines.length} items are added in one go. Trade pricing applies at checkout.</p>
          </div>
        </section>
      )}
    </div>
  );
}
