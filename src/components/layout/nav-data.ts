import type { ApplicationHub, Category } from "@/data/types";

export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export interface NavGroup extends NavLink {
  children: NavLink[];
}

export interface NavData {
  jobs: NavLink[];
  products: NavGroup[];
}

/** Hubs that aren't built yet still appear in "Shop by job", pointing at the closest live listing. */
const JOB_FALLBACKS: NavLink[] = [
  { label: "4WD & Touring", href: "/offroad-4wd-led-driving-lights/", description: "Driving lights, light bars and camp lighting" },
  { label: "Caravan & RV", href: "/leisure-led-lights/", description: "Interior, awning and exterior lights" },
  { label: "Marine", href: "/navigational-marine-led-lighting/", description: "Navigation, deck and flood lights" },
  { label: "Emergency & Fleet", href: "/emergency-led-warning-lights-vehicle-sirens/", description: "Beacons, light bars and sirens" },
];

/** `categories` should already exclude empty ones (no links to 404s, SPEC §8.3). */
export function buildNav(categories: Category[], hubs: ApplicationHub[]): NavData {
  const paths = new Set(categories.map((c) => c.path));
  const top = categories.filter((c) => c.parentId === null && c.onMenu).sort((a, b) => a.sortOrder - b.sortOrder);
  const products = top.map((c) => ({
    label: c.navLabel ?? c.name,
    href: c.path,
    children: categories
      .filter((k) => k.parentId === c.id && k.onMenu)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((k) => ({ label: k.navLabel ?? k.name, href: k.path })),
  }));
  const jobs: NavLink[] = [
    ...hubs.map((h) => ({ label: h.navLabel, href: h.path, description: h.summary.split(". ")[0] })),
    ...JOB_FALLBACKS.filter((j) => paths.has(j.href)),
  ];
  return { jobs, products };
}
