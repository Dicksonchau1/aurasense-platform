import { AccountManagerView } from '@/atlas/csm/AccountManagerView';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'ATLAS Account Manager' };

export default function Page() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <AccountManagerView />
    </main>
  );
}
