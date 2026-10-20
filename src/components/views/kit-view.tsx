import { KitBuilder, type KitCandidate } from "@/components/kit/kit-builder";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { JsonLd } from "@/components/ui/json-ld";
import { data } from "@/data";
import type { Kit } from "@/data/types";
import { breadcrumbList } from "@/seo/jsonld";

export async function KitView({ kit }: { kit: Kit }) {
  const skus = [...new Set(kit.steps.flatMap((s) => s.candidateSkus))];
  const [cards, products, hubs] = await Promise.all([
    data.getProductCards(skus),
    Promise.all(skus.map((s) => data.getProductBySku(s))),
    data.getApplicationHubs(),
  ]);
  const compat = new Map(products.filter((p) => p !== null).map((p) => [p.sku, p.compatibleWith]));
  const candidates: Record<string, KitCandidate> = Object.fromEntries(cards.map((c) => [c.sku, { ...c, compatibleWith: compat.get(c.sku) ?? [] }]));
  const hub = hubs.find((h) => h.featuredKitPath === kit.path);
  const crumbs = [
    { name: "Home", path: "/" },
    ...(hub ? [{ name: hub.navLabel, path: hub.path }] : []),
    { name: kit.name, path: kit.path },
  ];

  return (
    <div className="container-x pt-4 pb-8">
      <Breadcrumbs items={crumbs} />
      <header className="mt-4 max-w-3xl">
        <p className="eyebrow text-action">Kit builder</p>
        <h1 className="display mt-1 text-d4">{kit.name}</h1>
        <p className="mt-3 text-lg text-fg-muted">{kit.summary}</p>
      </header>
      <div className="mt-8">
        <KitBuilder kit={kit} candidates={candidates} />
      </div>
      <JsonLd data={breadcrumbList(crumbs)} />
    </div>
  );
}
