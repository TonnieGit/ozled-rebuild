import { notFound } from "next/navigation";

/** proxy.ts rewrites unknown paths here; notFound() outside Suspense gives a real 404 status. */
export default function Missing() {
  notFound();
}
