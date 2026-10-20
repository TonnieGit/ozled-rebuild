import { data } from "@/data";
import { getSite } from "@/lib/site";
import { absoluteUrl } from "@/seo/metadata";

/** /llms.txt: a plain summary of the site for AI answer engines (SPEC §9). */
export async function GET() {
  const site = getSite();
  const [tree, hubs, posts] = await Promise.all([data.getCategoryTree(), data.getApplicationHubs(), data.getBlogPosts({ pageSize: 50 })]);
  const top = tree.filter((c) => c.parentId === null && c.onMenu);
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.name} is an Australian retailer of LED vehicle lighting: tail lights, trailer lights, light bars, work lights, indicators, warning and emergency lighting, plugs and wiring.${site.address ? ` Showroom in ${site.address.locality} ${site.address.region}.` : ""}${site.foundingYear ? ` Supplying since ${site.foundingYear}.` : ""} Prices are in AUD including GST.`,
    "",
    "## Shop by job",
    ...hubs.map((h) => `- [${h.name}](${absoluteUrl(h.path)}): ${h.summary}`),
    "",
    "## Product categories",
    ...top.map((c) => `- [${c.name}](${absoluteUrl(c.path)}): ${c.intro}`),
    "",
    "## Guides",
    ...posts.items.map((p) => `- [${p.title}](${absoluteUrl(p.path)}): ${p.excerpt}`),
    "",
    "## Policies",
    `- [Shipping](${absoluteUrl("/shipping-details-terms-conditions")})`,
    `- [Restricted items](${absoluteUrl("/restricted-item-policy/")})`,
    `- [Trade & fleet](${absoluteUrl("/trade")})`,
  ];
  return new Response(lines.join("\n") + "\n", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
