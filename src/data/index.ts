import "server-only";
import type { DataSource } from "./types";
import { fixtures } from "./fixtures";
import { neto } from "./neto";

/** Picks the DataSource from DATA_SOURCE (SPEC §5). Server-only: Neto credentials never reach the browser. */
function pick(): DataSource {
  const source = process.env.DATA_SOURCE ?? "fixtures";
  if (source === "neto") return neto;
  if (source !== "fixtures") throw new Error(`Unknown DATA_SOURCE "${source}" (expected fixtures | neto)`);
  return fixtures;
}

export const data: DataSource = pick();
export type * from "./types";
