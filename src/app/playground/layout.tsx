import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

export const metadata = { title: 'AuraSense · Playground' };
const ALLOWED_PLANS = ['starter','pro','team','enterprise'] as const;
type Plan = typeof ALLOWED_PLANS[number];

export default async function PlaygroundLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/playground');

  const { data: profile } = await supabase
    .from('user_plans').select('plan').eq('user_id', user.id).maybeSingle();
  if (!profile || !ALLOWED_PLANS.includes(profile.plan as Plan)) {
    redirect('/pricing?reason=playground');
  }
  return <>{children}</>;
}
