import type { Metadata } from "next";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ozled.com.au").replace(/\/$/, "");

/** Canonical = absolute URL of the clean route path, never from a title field (SPEC §8.2). */
export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).toString();
}

export function pageMetadata({
  title,
  description,
  path,
  image,
  noindex = false,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  image?: { src: string; alt: string; width?: number; height?: number };
  noindex?: boolean;
  type?: "website" | "article";
}): Metadata {
  const url = absoluteUrl(path);
  const images = image ? [{ url: absoluteUrl(image.src), alt: image.alt, width: image.width, height: image.height }] : undefined;
  return {
    // Titles arrive already in "{keyword} | OzLED" form; `absolute` stops the layout template doubling it.
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url, siteName: "OzLED", locale: "en_AU", type, images },
    twitter: { card: images ? "summary_large_image" : "summary", title, description, images: images?.map((i) => i.url) },
  };
}
