"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./atlas-os.css";

interface NavItem {
  href: string;
  label: string;
}
interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV: NavSection[] = [
  {
    title: "Operations",
    items: [{ href: "/dashboard", label: "Operational Dashboard" }],
  },
  {
    title: "Drone",
    items: [
      { href: "/dashboard/drone-specs", label: "Drone Specs" },
      { href: "/dashboard/robot-specs", label: "Robot Specs" },
    ],
  },
  {
    title: "World",
    items: [{ href: "/dashboard/world-model", label: "World Model" }],
  },
  {
    title: "Intelligence",
    items: [{ href: "/dashboard/skills", label: "Skills Library" }],
  },
  {
    title: "Mission",
    items: [{ href: "/dashboard/mission-planner", label: "Mission Planner" }],
  },
  {
    title: "Governance",
    items: [
      { href: "/dashboard/audit", label: "Audit" },
      { href: "/dashboard/compliance", label: "Compliance" },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/dashboard/billing", label: "Billing Plans" },
      { href: "/dashboard/settings", label: "Settings" },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="atlas-os">
      <div className="atlas-shell">
        {/* Topbar */}
        <header className="atlas-topbar">
          <div className="atlas-logo">AT</div>
          <div className="atlas-brand">
            <span className="atlas-brand-name">ATLAS OS</span>
            <span className="atlas-brand-sub">AuraSense</span>
          </div>
          <span className="atlas-shell-badge">v11</span>
          <div className="atlas-divider" />
          <div className="atlas-tb-right">
            <div className="atlas-fit-pill">
              <span>ATLAS Fit</span>
              <span className="v">87</span>
              <span style={{ opacity: 0.6 }}>/100</span>
            </div>
            <Link href="/login" className="atlas-tb-icon" title="Account">A</Link>
          </div>
        </header>

        {/* Body: Sidebar + Main */}
        <div className="atlas-body">
          <aside className="atlas-sidebar">
            {NAV.map((section) => (
              <div key={section.title}>
                <div className="atlas-ns">{section.title}</div>
                {section.items.map((item) => {
                  const active =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={"atlas-nb" + (active ? " active" : "")}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </aside>

          {/* Viewport */}
          <main className="atlas-viewport">{children}</main>
        </div>

        {/* Status Bar */}
        <footer className="atlas-statusbar">
          <span className="atlas-st-item"><span className="atlas-dot ok" /> LINK OK</span>
          <span className="atlas-st-item"><span className="atlas-dot ok" /> NEPA online</span>
          <span className="atlas-st-item" style={{ marginLeft: "auto" }}>ATLAS Fit 87/100</span>
        </footer>
      </div>
    </div>
  );
}
