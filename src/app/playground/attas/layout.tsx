import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

const PAID_PLANS = ['pro','team','enterprise'] as const;
type PaidPlan = typeof PAID_PLANS[number];

export default async function AttasLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/playground/attas');

  const { data: profile } = await supabase
    .from('user_plans').select('plan').eq('user_id', user.id).maybeSingle();
  if (!profile || !PAID_PLANS.includes(profile.plan as PaidPlan)) {
    redirect('/pricing?reason=attas&plan=pro');
  }
  return <>{children}</>;
}
