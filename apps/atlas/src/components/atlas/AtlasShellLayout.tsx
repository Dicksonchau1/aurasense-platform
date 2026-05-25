import React from 'react';
import Link from 'next/link';

const navItems = [
  { href: '/atlas/dashboard', label: 'Dashboard' },
  { href: '/atlas/drones', label: 'Drones' },
  { href: '/atlas/robot-specs', label: 'Robot Specs' },
  { href: '/atlas/world-model', label: 'World Model' },
  { href: '/atlas/skills', label: 'Skills' },
  { href: '/atlas/missions', label: 'Missions' },
  { href: '/atlas/audit', label: 'Audit' },
  { href: '/atlas/compliance', label: 'Compliance' },
  { href: '/atlas/billing', label: 'Billing' },
  { href: '/atlas/settings', label: 'Settings' },
];

export default function AtlasShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="atlas-shell">
      <aside className="atlas-nav">
        <div className="atlas-brand">ATLAS</div>
        <nav>
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="atlas-main">
        <header className="atlas-topbar">
          {/* TODO: Add top bar content, status indicators, settings, alerts */}
        </header>
        <section className="atlas-content">{children}</section>
      </main>
    </div>
  );
}
