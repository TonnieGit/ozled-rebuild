export interface SiteInfo {
  name: string;
  legalName: string;
  url: string;
  abn?: string;
  phone?: { label: string; href: string };
  email?: string;
  address?: { street: string; locality: string; region: string; postcode: string; country: string };
  geo?: { lat: number; lng: number };
  /** schema.org-style: e.g. { days: ["Monday", ...], opens: "08:00", closes: "17:00" } */
  hours: { days: string[]; opens: string; closes: string }[];
  socials: { label: string; url: string }[];
  foundingYear?: number;
  paymentMethods: string[];
  freeShippingFrom?: number;
  footer: { title: string; links: { label: string; href: string }[] }[];
}
