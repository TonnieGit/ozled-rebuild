import { cacheLife, cacheTag } from "next/cache";
import { LazyCartDrawer } from "@/components/cart/lazy-cart-drawer";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { buildNav } from "@/components/layout/nav-data";
import { NoticeStrip } from "@/components/layout/notice-strip";
import { JsonLd } from "@/components/ui/json-ld";
import { data } from "@/data";
import { nonEmpty } from "@/data/non-empty";
import { getSite } from "@/lib/site";
import { organization, website } from "@/seo/jsonld";

/** Chrome data, cached for an hour and revalidated with the catalogue. */
async function getChrome() {
  "use cache";
  cacheLife("hours");
  cacheTag("catalogue");
  const [categories, hubs, notices] = await Promise.all([data.getCategoryTree(), data.getApplicationHubs(), data.getBanners("site-notice")]);
  return { nav: buildNav(await nonEmpty(categories), hubs), notice: notices[0] };
}

/** Notice strip, header, footer, cart drawer and site JSON-LD around any page. */
export async function StoreChrome({ children }: { children: React.ReactNode }) {
  const { nav, notice } = await getChrome();
  const site = getSite();
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <NoticeStrip notice={notice} site={site} />
      <Header nav={nav} site={site} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer site={site} />
      <LazyCartDrawer paymentMethods={site.paymentMethods} freeShippingFrom={site.freeShippingFrom} />
      <JsonLd data={[organization(site), website()]} />
    </>
  );
}
