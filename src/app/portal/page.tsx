import { redirect } from "next/navigation";
import { cookies } from "next/headers";
// TODO: VERIFY import path — your repo may haveWrite-AtlasFile 'src\app\portal\page.tsx' @'
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
// TODO: VERIFY import path — your repo may have @/lib/supabase/server OR /admin OR /client
import { createClient } from "@/lib/supabase/server";
// TODO: VERIFY this constant exists in src/lib/auth/domain-router.ts
import { TIER_COOKIE, type Tier } from "@/lib/auth/domain-router";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const cookieStore = await cookies();
  const tierCookie = cookieStore.get(TIER_COOKIE)?.value as Tier | undefined;

  // Try Supabase session as the source of truth
  let tier: Tier | undefined = tierCookie;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login?redirect=%2Fportal");
    }

    // TODO: VERIFY table + column — your users table may store plan as `plan` (PlanKey)
    // and a derived tier, OR a `tier` column directly. Adjust the .select() and mapping below.
    const { data: row } = await supabase
      .from("users")
      .select("plan, tier")
      .eq("id", user!.id)
      .maybeSingle();

    if (row?.tier) {
      tier = row.tier as Tier;
    } else if (row?.plan) {
      // TODO: VERIFY plan-to-tier mapping. This is a placeholder rule.
      const plan = String(row.plan);
      if (plan === "enterprise" || plan === "team") tier = "enterprise";
      else if (plan === "nursing" || plan === "pro") tier = "nursing";
      else tier = "free";
    }
  } catch {
    // Fall back to cookie tier if Supabase is unreachable
  }

  switch (tier) {
    case "enterprise":
      redirect("/dashboard");
    case "nursing":
      redirect("/rehearse");
    case "free":
    default:
      redirect("/playground");
  }
}