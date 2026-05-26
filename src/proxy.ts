import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { TIER_COOKIE, type Tier } from "@/lib/auth/domain-router"

/**
 * Combined proxy: Supabase session refresh + tier-gating.
 *
 * Replaces the deprecated src/middleware.ts in Next.js 16.
 *
 * Behaviour:
 *   - Refreshes the Supabase session on every request (cookies)
 *   - Protects /account: signed-out users → /login
 *   - Tier-gates /rehearse (nursing/enterprise) and /drone (enterprise)
 *   - /playground stays open to everyone
 *
 * NOT the source of truth for entitlements — backend APIs must still
 * verify the user's session and tier server-side before serving
 * privileged data.
 */

const TIER_GATES: Array<{ prefix: string; allow: Tier[]; redirect: string }> = [
  { prefix: "/rehearse", allow: ["nursing", "enterprise"], redirect: "/playground?u=rehearse" },
  { prefix: "/drone",    allow: ["enterprise"],            redirect: "/pricing#enterprise" },
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — do NOT write logic between createServerClient and getUser
  const { data: { user } } = await supabase.auth.getUser()

  // Protect /account
  if (!user && pathname.startsWith("/account")) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Tier gates for /rehearse and /drone
  const gate = TIER_GATES.find((g) => pathname.startsWith(g.prefix))
  if (gate) {
    const tier = (request.cookies.get(TIER_COOKIE)?.value ?? "") as Tier | ""

    if (!tier) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("next", pathname)
      return NextResponse.redirect(url)
    }

    if (!gate.allow.includes(tier as Tier)) {
      return NextResponse.redirect(new URL(gate.redirect, request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}