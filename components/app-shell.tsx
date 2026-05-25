import Link from 'next/link';
import { ReactNode } from 'react';

const navigation = [
  { href: '/', label: 'Dashboard' },
  { href: '/missions', label: 'Missions' },
  { href: '/worlds', label: 'Worlds' },
  { href: '/agents', label: 'Agents' },
  { href: '/runs', label: 'Runs' },
  { href: '/settings', label: 'Settings' },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="atlas-shell">
      <div className="grid min-h-screen lg:grid-cols-[88px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-white/5 bg-slate-950/70 px-4 py-5 backdrop-blur-xl lg:border-b-0 lg:border-r lg:px-5">
          <div className="flex items-center justify-between xl:justify-start xl:gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-teal-400/10 text-teal-300 shadow-[0_0_30px_rgba(31,182,166,0.18)]">
              <span className="text-lg font-semibold">A</span>
            </div>
            <div className="hidden xl:block">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">AuraSense</p>
              <h1 className="mt-1 text-xl font-semibold text-white">ATLAS</h1>
            </div>
            <div className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-400 xl:hidden">
              Live
            </div>
          </div>

          <nav className="mt-8 grid grid-cols-5 gap-2 lg:grid-cols-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-[52px] items-center justify-center rounded-xl border border-transparent bg-white/[0.02] px-3 text-center text-xs font-medium text-slate-400 transition hover:border-white/10 hover:bg-white/[0.04] hover:text-white xl:justify-start xl:px-4 xl:text-sm"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-6 hidden rounded-xl border border-white/10 bg-white/[0.03] p-4 xl:block">
            <p className="atlas-label">Mode</p>
            <p className="mt-2 text-sm font-medium text-white">Prototype control plane</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">Design-system pass enabled with mock data for layout validation and rapid iteration.</p>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/65 backdrop-blur-xl">
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 xl:flex-row xl:items-center xl:justify-between xl:px-8">
              <div>
                <p className="atlas-label">AuraSense operations console</p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Monitor worlds, inspect orchestration state, and move toward live agent execution from a single surface.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300">
                  Auth gate mock: <span className="font-medium text-white">Founder</span>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sm font-semibold text-white">
                  D
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 xl:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
