import { NextResponse } from "next/server";

/**
 * Response helpers. Every endpoint answers in the same envelope so the
 * storefront never has to guess at a shape.
 */

export interface ApiMeta {
  [key: string]: unknown;
}

export const ok = <T>(data: T, meta?: ApiMeta, init?: ResponseInit) =>
  NextResponse.json({ ok: true, data, ...(meta ? { meta } : {}) }, init);

export const fail = (status: number, message: string, details?: unknown) =>
  NextResponse.json({ ok: false, error: { message, ...(details ? { details } : {}) } }, { status });

/** Phase 2 endpoints answer this rather than 404, so the contract is visible. */
export const notYet = (feature: string, plan: string) =>
  NextResponse.json(
    {
      ok: false,
      error: {
        message: `${feature} is not enabled yet.`,
        phase: 2,
        plan,
      },
    },
    { status: 501 },
  );

/** Cache headers for catalogue reads — safe to cache, cheap to revalidate. */
export const CATALOGUE_CACHE = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
};

export const readJson = async <T>(req: Request): Promise<T | null> => {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
};

/** Trim and cap a string from an untrusted body. */
export const str = (v: unknown, max = 500): string =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

/** Loose but useful: catches typos without rejecting valid odd addresses. */
export const isEmail = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

/** Accepts +91 98765 43210, 09876543210, etc. Requires 8–15 digits. */
export const isPhone = (v: string): boolean => {
  const digits = v.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
};
