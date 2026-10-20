import Image from "next/image";
import Link from "next/link";
import type { SiteInfo } from "@/lib/site-types";
import { Icon } from "@/components/icon";
import { commerceUrl } from "@/lib/commerce";

const DAY_SHORT: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

function hoursLabel(h: SiteInfo["hours"][number]): string {
  const days = h.days.map((d) => DAY_SHORT[d] ?? d);
  const range = days.length > 2 ? `${days[0]}–${days[days.length - 1]}` : days.join(", ");
  const t = (s: string) => {
    const [hh, mm] = s.split(":").map(Number);
    const suffix = hh >= 12 ? "pm" : "am";
    const h12 = hh % 12 || 12;
    return mm ? `${h12}:${String(mm).padStart(2, "0")}${suffix}` : `${h12}${suffix}`;
  };
  return `${range} ${t(h.opens)}–${t(h.closes)}`;
}

function isInternal(href: string) {
  return href.startsWith("/") && !href.startsWith("/_") && !href.startsWith("/form/");
}

export function Footer({ site }: { site: SiteInfo }) {
  const year = 2026;
  return (
    <footer className="mt-24 bg-chrome text-chrome-fg">
      <div className="h-1 bg-brand" aria-hidden />
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div>
          <Image src="/brand/ozled-logo.png" alt={site.name} width={466} height={104} className="h-8 w-auto" />
          {site.foundingYear && (
            <p className="mt-4 max-w-xs text-sm text-chrome-fg-muted">
              Supplying LED vehicle lighting to Australian tradies, fleets and emergency services since {site.foundingYear}.
            </p>
          )}
          <address className="mt-6 space-y-2 text-sm not-italic text-chrome-fg-muted">
            {site.address && (
              <p className="flex gap-2">
                <Icon name="store" size={16} className="mt-0.5 shrink-0" />
                <span>
                  {site.address.street}, {site.address.locality} {site.address.region} {site.address.postcode}
                </span>
              </p>
            )}
            {site.hours.map((h) => (
              <p key={h.days.join()} className="flex gap-2">
                <Icon name="clock" size={16} className="mt-0.5 shrink-0" />
                {hoursLabel(h)}
              </p>
            ))}
            {site.phone && (
              <p>
                <a href={site.phone.href} className="flex gap-2 font-semibold text-chrome-fg hover:text-white">
                  <Icon name="phone" size={16} className="mt-0.5 shrink-0" />
                  {site.phone.label}
                </a>
              </p>
            )}
            {site.email && (
              <p>
                <a href={`mailto:${site.email}`} className="hover:text-white">
                  {site.email}
                </a>
              </p>
            )}
          </address>
        </div>
        {site.footer.slice(0, 3).map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="eyebrow text-white">{group.title}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {group.links.map((l) => (
                <li key={l.href + l.label}>
                  {isInternal(l.href) ? (
                    <Link href={l.href} className="text-chrome-fg-muted hover:text-white">
                      {l.label}
                    </Link>
                  ) : (
                    <a href={commerceUrl(l.href)} className="text-chrome-fg-muted hover:text-white">
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-chrome-border">
        <div className="container-x flex flex-col gap-4 py-6 text-xs text-chrome-fg-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {site.legalName}
            {site.abn && <> · ABN {site.abn}</>}
          </p>
          {site.paymentMethods.length > 0 && <p>We accept {site.paymentMethods.join(" · ")}</p>}
          {site.socials.length > 0 && (
            <ul className="flex gap-4">
              {site.socials.map((s) => (
                <li key={s.url}>
                  <a href={s.url} rel="noopener" className="hover:text-white">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
