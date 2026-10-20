import Link from "next/link";
import { SearchBox } from "@/components/layout/search-box";

export default function NotFound() {
  return (
    <div className="container-x py-20 text-center">
      <p className="eyebrow text-action">404</p>
      <h1 className="display mt-2 text-d4">We can’t find that page</h1>
      <p className="mx-auto mt-3 max-w-lg text-fg-muted">It may have moved. Try a search, or start from one of these.</p>
      <div className="mx-auto mt-6 max-w-lg text-left">
        <SearchBox variant="page" />
      </div>
      <ul className="mt-8 flex flex-wrap justify-center gap-2">
        {[
          ["LED tail lights", "/led-tail-lights/"],
          ["Ute & tray lighting", "/ute-tray-lights/"],
          ["Trailer & boat", "/trailer-boat-lights/"],
          ["Guides", "/blog/"],
        ].map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="flex h-10 items-center rounded-full border border-border-strong px-4 text-sm font-medium hover:border-fg">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
