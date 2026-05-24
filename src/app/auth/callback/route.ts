import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  isUnknownEnterprise,
  landingPathForEmail,
  SALES_REVIEW_COOKIE,
  tierForEmail,
  TIER_COOKIE,
} from "@/lib/auth/domain-router";

/**
 * Magic-link / OAuth callback.
 *
 * Flow:
 *   1. Exchange the auth code for a Supabase session.
 *   2. Read the signed-in user's email.
 *   3. Resolve their tier from the email domain (see `domain-router.ts`).
 *   4. Drop a `aurasense.tier` cookie so client UI and middleware can read it.
 *   5. If `?next=...` was provided AND the user is allowed there, honour it.
 *      Otherwise redirect to the tier-default landing path.
 *
 * The cookie is a soft UI hint — the source of truth for entitlements
 * stays on the backend (`/api/tier/policy` on NEPA). Middleware that
 * actually blocks a surface must re-derive the tier server-side.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no-code", req.url));
  }

  const sb = await createClient();
  const { data, error } = await sb.auth.exchangeCodeForSession(code);

  if (error || !data.user?.email) {
    const msg = encodeURIComponent(error?.message ?? "exchange-failed");
    return NextResponse.redirect(new URL(`/login?error=${msg}`, req.url));
  }

  const email = data.user.email;
  const tier = tierForEmail(email);
  const fallback = landingPathForEmail(email);

  // Honour ?next= only if it's a safe same-origin path; otherwise use
  // the tier default. This stops open-redirect tricks via the callback.
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;

  const res = NextResponse.redirect(new URL(safeNext, req.url));

  // 30-day tier cookie. Not signed — middleware re-derives from session
  // for real entitlement checks; this is purely a UI hint.
  res.cookies.set(TIER_COOKIE, tier, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  if (tier === "enterprise" && isUnknownEnterprise(email)) {
    res.cookies.set(SALES_REVIEW_COOKIE, "1", {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  } else {
    res.cookies.delete(SALES_REVIEW_COOKIE);
  }

  return res;
}
