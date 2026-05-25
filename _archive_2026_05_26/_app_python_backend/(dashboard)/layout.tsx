// Dashboard Layout with Sidebar and Header
import Link from 'next/link';
import { ReactNode } from 'react';

import { useAgents } from '../../src/hooks/use-agents';
import { useState } from 'react';

const navItems = [
  { href: '/(dashboard)', label: 'Dashboard' },
  { href: '/(dashboard)/fleet', label: 'Fleet' },
  { href: '/(dashboard)/agent', label: 'Agent' },
  { href: '/(dashboard)/mission-planner', label: 'Mission Planner' },
  { href: '/(dashboard)/mission-simulation', label: 'Mission Simulation' },
  { href: '/(dashboard)/world-model', label: 'World Model' },
  { href: '/(dashboard)/learning-loop', label: 'Learning Loop' },
  { href: '/(dashboard)/runtime', label: 'Runtime' },
  { href: '/(dashboard)/activity-log', label: 'Activity Log' },
  { href: '/(dashboard)/account', label: 'Account' },
  { href: '/(dashboard)/billing', label: 'Billing' },
  { href: '/(dashboard)/data-export', label: 'Data Export' },
  { href: '/(dashboard)/settings', label: 'Settings' },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  // Sidebar agent status
  const { data: agents, isLoading } = typeof useAgents === 'function' ? useAgents() : { data: [], isLoading: false };
  const [submenuOpen, setSubmenuOpen] = useState(false);
  return (
    <div className="app-shell active min-h-screen flex">
      {/* Sidebar */}
      <aside className="sidebar w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="sidebar-header flex items-center gap-3 h-16 px-6 border-b border-gray-200">
          <span className="logo-mark w-7 h-7 bg-blue-400 rounded-lg flex items-center justify-center text-white font-bold">A</span>
          <span className="sidebar-brand-name font-bold text-lg">ATLAS OS</span>
        </div>
        <nav className="sidebar-nav flex-1 px-2 py-4">
          {navItems.map(item => {
            if (item.label === 'Agent') {
              return (
                <div key="agents-submenu" className="mb-2">
                  <button
                    className="nav-item block px-3 py-2 rounded-md text-gray-700 hover:bg-blue-50 font-medium w-full text-left flex items-center justify-between"
                    onClick={() => setSubmenuOpen(v => !v)}
                  >
                    Agents
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {isLoading ? '...' : (agents?.length || 0)}
                    </span>
                    <svg className={`ml-1 w-3 h-3 transition-transform ${submenuOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                  {submenuOpen && (
                    <div className="ml-4 mt-1">
                      {Array.isArray(agents) && agents.length > 0 ? (
                        <ul className="text-sm">
                          {agents.map((agent: any) => (
                            <li key={agent.id} className="mb-1 flex items-center gap-2">
                              <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                              <span>{agent.name}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-xs text-gray-400">No agents</span>
                      )}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link key={item.href} href={item.href} className="nav-item block px-3 py-2 rounded-md text-gray-700 hover:bg-blue-50 font-medium">
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer p-4 border-t border-gray-200 text-xs text-gray-500">AuraSense Robotics</div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 bg-gray-50 min-h-screen">
        <header className="top-header bg-white border-b border-gray-200 px-8 py-4 flex items-center">
          <h1 className="page-title text-xl font-bold flex-1">ATLAS OS Dashboard</h1>
        </header>
        <div>{children}</div>
      </main>
    </div>
  );
}
