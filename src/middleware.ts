import { NextRequest, NextResponse } from 'next/server'
import { TIER_COOKIE, type Tier } from '@/lib/auth/domain-router'

/**
 * Tier-gate middleware.
 *
 * Soft-gates the three tier-specific surfaces by reading the
 * `aurasense.tier` cookie set in the auth callback. This is NOT
 * the source of truth for entitlements — backend APIs must still
 * verify the user's session and tier server-side before serving
 * privileged data. The middleware only:
 *
 *   - Redirects signed-out / no-cookie users to /login with ?next=
 *   - Redirects logged-in users away from a surface they shouldn't see
 *
 * /playground stays open to everyone (it's the free demo).
 * /rehearse  requires tier in { nursing, enterprise } — enterprise users
 *            who want to see the nursing surface for evaluation can still
 *            access it; free users get bumped back to /playground.
 * /drone     requires tier === 'enterprise'. Nursing and free users get
 *            sent to /pricing#enterprise to learn how to upgrade.
 */

const GATED: Array<{ prefix: string; allow: Tier[]; redirect: string }> = [
  { prefix: '/rehearse', allow: ['nursing', 'enterprise'], redirect: '/playground?u=rehearse' },
  { prefix: '/drone',    allow: ['enterprise'],            redirect: '/pricing#enterprise' },
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const match = GATED.find((g) => pathname.startsWith(g.prefix))
  if (!match) return NextResponse.next()

  const tier = (req.cookies.get(TIER_COOKIE)?.value ?? '') as Tier | ''

  // No cookie → not signed in (or cookie cleared). Send to /login with a
  // ?next= back to where they were headed; the callback will land them
  // correctly after auth and we'll re-hit the middleware with a cookie.
  if (!tier) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (!match.allow.includes(tier as Tier)) {
    return NextResponse.redirect(new URL(match.redirect, req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/rehearse/:path*', '/drone/:path*'],
}
