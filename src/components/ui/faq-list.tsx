import type { Faq } from "@/data/types";
import { Icon } from "@/components/icon";

/**
 * FAQs as native <details>: answers are in the server HTML (crawlable, SPEC §9),
 * open/close needs no JS, and keyboard support comes free.
 */
export function FaqList({ faqs, headingId }: { faqs: Faq[]; headingId?: string }) {
  if (!faqs.length) return null;
  return (
    <div className="divide-y divide-border border-y border-border" aria-labelledby={headingId}>
      {faqs.map((f) => (
        <details key={f.question} className="group py-1">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold [&::-webkit-details-marker]:hidden">
            <h3 className="text-base">{f.question}</h3>
            <Icon name="plus" size={20} className="shrink-0 transition-transform group-open:rotate-45" />
          </summary>
          <p className="pb-5 text-fg-muted">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}
