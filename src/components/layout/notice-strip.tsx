import Link from "next/link";
import type { Banner } from "@/data/types";
import type { SiteInfo } from "@/lib/site-types";
import { Icon } from "@/components/icon";

/** Single-line notice above the header; phone + pickup live here, not in the header (SPEC §7.1). */
export function NoticeStrip({ notice, site }: { notice?: Banner; site: SiteInfo }) {
  return (
    <div className="border-b border-chrome-border bg-chrome-raised text-[13px] text-chrome-fg">
      <div className="container-x flex h-(--oz-notice-h) items-center justify-center gap-6 md:justify-between">
        <p className="flex min-w-0 items-center gap-2 truncate">
          <Icon name="truck" size={16} className="shrink-0 text-signal" />
          {notice?.ctaUrl ? (
            <Link href={notice.ctaUrl} className="truncate hover:underline">
              {notice.headline}
            </Link>
          ) : (
            <span className="truncate">{notice?.headline ?? "Fast dispatch Australia-wide"}</span>
          )}
        </p>
        <div className="hidden shrink-0 items-center gap-5 text-chrome-fg-muted md:flex">
          {site.address && (
            <span className="flex items-center gap-1.5">
              <Icon name="store" size={15} /> Pickup in {site.address.locality}
            </span>
          )}
          <Link href="/trade/" className="hover:text-white">
            Trade & fleet
          </Link>
          {site.phone && (
            <a href={site.phone.href} className="flex items-center gap-1.5 font-semibold text-chrome-fg hover:text-white">
              <Icon name="phone" size={15} /> {site.phone.label}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
