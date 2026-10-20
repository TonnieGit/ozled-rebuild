import type { Metadata } from "next";
import { Icon } from "@/components/icon";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FaqList } from "@/components/ui/faq-list";
import { JsonLd } from "@/components/ui/json-ld";
import { FleetQuoteForm } from "@/components/trade/fleet-quote-form";
import { commerceUrl } from "@/lib/commerce";
import { getSite } from "@/lib/site";
import { breadcrumbList, faqPage } from "@/seo/jsonld";
import { pageMetadata } from "@/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Trade & Fleet Accounts | OzLED",
  description:
    "Trade pricing on LED vehicle lighting for auto electricians, body builders, fleets and emergency services. Apply for a trade account or request a fleet quote.",
  path: "/trade/",
});

const FAQS = [
  {
    question: "Who can open a trade account?",
    answer: "Businesses with an ABN that install, fit out or maintain vehicles: auto electricians, body and tray builders, fleet operators, councils and emergency service suppliers.",
  },
  {
    question: "How is trade pricing applied?",
    answer: "Once your account is approved, sign in before you check out and your trade price is applied automatically in the cart.",
  },
  {
    question: "Can trade accounts buy restricted red and blue lights?",
    answer: "Restricted items need separate authorisation. Request a quote and our team will confirm what documentation is required for your organisation.",
  },
];

export default function TradePage() {
  const site = getSite();
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Trade & fleet", path: "/trade/" },
  ];
  return (
    <>
      <section className="bg-chrome text-chrome-fg">
        <div className="container-x py-12 md:py-16">
          <div className="[&_a]:text-chrome-fg-muted [&_nav]:text-chrome-fg-muted [&_span[aria-current]]:text-chrome-fg">
            <Breadcrumbs items={crumbs} />
          </div>
          <h1 className="display mt-6 max-w-3xl text-d5">Trade & fleet</h1>
          <p className="mt-4 max-w-2xl text-lg text-neutral-200">
            Trade pricing, bulk and fleet quotes, and a team that knows vehicle lighting. Built for auto electricians, tray and body builders, fleets and emergency service suppliers.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={commerceUrl("/form/register-trade/")} className="inline-flex h-12 items-center gap-2 rounded-md bg-action px-6 font-semibold text-action-fg hover:bg-action-hover">
              Apply for a trade account <Icon name="arrowRight" size={18} />
            </a>
            <a href="#fleet-quote" className="inline-flex h-12 items-center rounded-md border border-white/40 px-6 font-semibold text-white hover:bg-white/10">
              Request a fleet quote
            </a>
          </div>
        </div>
      </section>

      <div className="container-x mt-14 grid gap-16">
        <section aria-labelledby="benefits-h">
          <h2 id="benefits-h" className="display text-d3">
            What you get
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "user" as const, t: "Trade pricing", d: "Applied automatically at checkout when you’re signed in." },
              { icon: "truck" as const, t: "Bulk & fleet quotes", d: "Multi-line quotes for fit-outs and fleet roll-outs." },
              { icon: "store" as const, t: site.address ? `${site.address.locality} pickup` : "Showroom pickup", d: "Collect same day from our showroom." },
              { icon: "wrench" as const, t: "Technical support", d: "Wiring diagrams, datasheets and ADR advice from our team." },
            ].map((b) => (
              <li key={b.t} className="rounded-lg border border-border p-6">
                <Icon name={b.icon} size={28} className="text-action" />
                <h3 className="mt-3 font-bold">{b.t}</h3>
                <p className="mt-1 text-sm text-fg-muted">{b.d}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <section id="fleet-quote" aria-labelledby="fleet-h" className="scroll-mt-28">
            <h2 id="fleet-h" className="display text-d3">
              Fleet quote request
            </h2>
            <p className="mt-2 text-fg-muted">List the SKUs and quantities you need. We’ll reply with pricing within one business day.</p>
            <FleetQuoteForm email={site.email} />
          </section>
          <section aria-labelledby="trade-faq">
            <h2 id="trade-faq" className="display text-d3">
              Trade FAQs
            </h2>
            <div className="mt-4">
              <FaqList faqs={FAQS} />
            </div>
          </section>
        </div>
      </div>
      <JsonLd data={[breadcrumbList(crumbs), faqPage(FAQS)!]} />
    </>
  );
}
