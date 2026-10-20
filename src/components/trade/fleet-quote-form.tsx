"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";

interface Line {
  sku: string;
  qty: string;
}

/**
 * Multi-line SKU + qty quote request (SPEC §7.7). Until a Neto form endpoint is
 * confirmed, it composes an email to the sales inbox so nothing is lost.
 */
export function FleetQuoteForm({ email }: { email?: string }) {
  const [lines, setLines] = useState<Line[]>([{ sku: "", qty: "1" }]);
  const to = email ?? "sales@ozled.com.au";

  return (
    <form
      className="mt-6 space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const body = [
          `Name: ${f.get("name")}`,
          `Business: ${f.get("business")}`,
          `ABN: ${f.get("abn")}`,
          `Email: ${f.get("email")}`,
          `Phone: ${f.get("phone")}`,
          "",
          "Items:",
          ...lines.filter((l) => l.sku.trim()).map((l) => `- ${l.sku.trim()} × ${l.qty}`),
          "",
          `Notes: ${f.get("notes") ?? ""}`,
        ].join("\n");
        window.location.href = `mailto:${to}?subject=${encodeURIComponent(`Fleet quote request – ${f.get("business")}`)}&body=${encodeURIComponent(body)}`;
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["name", "Your name", "text", "name"],
          ["business", "Business name", "text", "organization"],
          ["abn", "ABN", "text", "off"],
          ["email", "Email", "email", "email"],
          ["phone", "Phone", "tel", "tel"],
        ].map(([name, label, type, ac]) => (
          <label key={name} className="block text-sm">
            <span className="font-medium">{label}</span>
            <input name={name} type={type} autoComplete={ac} required={name !== "abn" && name !== "phone"} className="mt-1 h-11 w-full rounded-md border border-border-strong bg-surface px-3" />
          </label>
        ))}
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Items</legend>
        <ul className="mt-2 space-y-2">
          {lines.map((l, i) => (
            <li key={i} className="flex gap-2">
              <label className="flex-1">
                <span className="sr-only">SKU or product name, line {i + 1}</span>
                <input
                  value={l.sku}
                  onChange={(e) => setLines((ls) => ls.map((x, j) => (j === i ? { ...x, sku: e.target.value } : x)))}
                  placeholder="SKU or product name"
                  className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 font-mono text-sm"
                />
              </label>
              <label className="w-24">
                <span className="sr-only">Quantity, line {i + 1}</span>
                <input
                  value={l.qty}
                  inputMode="numeric"
                  onChange={(e) => setLines((ls) => ls.map((x, j) => (j === i ? { ...x, qty: e.target.value.replace(/\D/g, "") } : x)))}
                  className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-center tabular-nums"
                />
              </label>
              <button type="button" onClick={() => setLines((ls) => (ls.length > 1 ? ls.filter((_, j) => j !== i) : ls))} className="tap grid place-items-center rounded-md text-fg-muted hover:bg-bg-muted" disabled={lines.length === 1}>
                <Icon name="close" size={18} label={`Remove line ${i + 1}`} />
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => setLines((ls) => [...ls, { sku: "", qty: "1" }])} className="mt-2 inline-flex h-10 items-center gap-1 text-sm font-semibold text-link">
          <Icon name="plus" size={16} /> Add a line
        </button>
      </fieldset>

      <label className="block text-sm">
        <span className="font-medium">Notes</span>
        <textarea name="notes" rows={3} className="mt-1 w-full rounded-md border border-border-strong bg-surface p-3" />
      </label>
      <button type="submit" className="h-12 rounded-md bg-action px-6 font-semibold text-action-fg hover:bg-action-hover">
        Send quote request
      </button>
    </form>
  );
}
