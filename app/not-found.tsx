import type { Metadata } from "next";
import { StoreChrome } from "@/components/layout/store-chrome";
import { NotFoundContent } from "@/components/views/not-found-content";

export const metadata: Metadata = { title: { absolute: "Page not found | OzLED" }, robots: { index: false } };

/** Global 404 (unknown paths are rewritten here by proxy.ts) with the full store chrome. */
export default function NotFound() {
  return (
    <StoreChrome>
      <NotFoundContent />
    </StoreChrome>
  );
}
