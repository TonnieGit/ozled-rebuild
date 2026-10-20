import Image from "next/image";
import Link from "next/link";
import { CartButton } from "@/components/cart/cart-button";
import { Icon } from "@/components/icon";
import { commerceUrl } from "@/lib/commerce";
import type { SiteInfo } from "@/lib/site-types";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";
import type { NavData } from "./nav-data";
import { SearchBox } from "./search-box";

/** One-row header: < 72px desktop, 56px mobile (SPEC §7.1). */
export function Header({ nav, site }: { nav: NavData; site: SiteInfo }) {
  return (
    <header className="sticky top-0 z-30 bg-chrome text-chrome-fg">
      <div className="container-x relative flex h-(--oz-header-h) items-center gap-2 lg:gap-6">
        <MobileNav nav={nav} phone={site.phone} />
        <Link href="/" className="shrink-0 py-2" aria-label={`${site.name} home`}>
          <Image src="/brand/ozled-logo.png" alt={site.name} width={466} height={104} priority className="h-7 w-auto lg:h-8" />
        </Link>
        <nav aria-label="Main" className="h-full">
          <DesktopNav nav={nav} />
        </nav>
        <div className="ml-auto hidden max-w-md flex-1 md:block">
          <SearchBox />
        </div>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link href="/search" className="tap grid place-items-center text-chrome-fg hover:text-white md:hidden" aria-label="Search">
            <Icon name="search" size={22} />
          </Link>
          <a href={commerceUrl("/_myacct")} className="tap hidden place-items-center text-chrome-fg hover:text-white sm:grid" aria-label="My account">
            <Icon name="user" size={22} />
          </a>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
