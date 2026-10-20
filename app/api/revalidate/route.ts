import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { CATALOGUE_TAG } from "@/data/neto";

/**
 * Neto Notification Events webhook (SPEC §4.1, §4.2). Event names and payload
 * shape are a Phase 0 VERIFY, so any authenticated call revalidates the whole
 * catalogue snapshot; narrow to per-product tags once payloads are known.
 * Auth: shared secret in ?secret= or x-webhook-secret (Neto can't sign requests).
 */
export async function POST(request: NextRequest) {
  const secret = process.env.NETO_WEBHOOK_SECRET;
  const given = request.headers.get("x-webhook-secret") ?? request.nextUrl.searchParams.get("secret");
  if (!secret || given !== secret) return Response.json({ ok: false }, { status: 401 });

  const body = await request.text();
  console.info("[revalidate] Neto event", body.slice(0, 500));
  revalidateTag(CATALOGUE_TAG, "max");
  return Response.json({ ok: true, revalidated: [CATALOGUE_TAG] });
}
