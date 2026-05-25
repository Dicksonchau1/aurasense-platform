import "./atlas-os.css";
import Link from "next/link";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="atlas-os">
      <div className="atlas-shell">
        <header className="atlas-topbar">
          <div className="atlas-logo">AT</div>
          <div className="atlas-brand">
            <span className="atlas-brand-name">ATLAS OS</span>
            <span className="atlas-brand-sub">AuraSense</span>
          </div>
          <span className="atlas-shell-badge">v12</span>
          <div className="atlas-divider" />
          <div className="atlas-tb-right">
            <div className="atlas-fit-pill">
              <span>ATLAS Fit</span>
              <span className="v">87</span>
              <span style={{ opacity: 0.6 }}>/100</span>
            </div>
            <Link href="/login" className="atlas-tb-icon">A</Link>
          </div>
        </header>

        <div className="atlas-body">
          <aside className="atlas-sidebar">
            <div className="atlas-ns">Operations</div>
            <Link href="/dashboard" className="atlas-nb"><span className="atlas-nb-ico">#</span> Overview</Link>
            <Link href="/dashboard/mission-planner" className="atlas-nb"><span className="atlas-nb-ico">M</span> Mission Planner</Link>
            <Link href="/dashboard/world-model" className="atlas-nb"><span className="atlas-nb-ico">W</span> World Model</Link>
            <Link href="/dashboard/fleet" className="atlas-nb"><span className="atlas-nb-ico">F</span> Fleet</Link>
            <Link href="/dashboard/learning-loop" className="atlas-nb"><span className="atlas-nb-ico">L</span> Learning Loop</Link>

            <div className="atlas-ns">Platform</div>
            <Link href="/atlas/nepa" className="atlas-nb"><span className="atlas-nb-ico">N</span> NEPA</Link>
            <Link href="/atlas/registry" className="atlas-nb"><span className="atlas-nb-ico">R</span> Registry</Link>
            <Link href="/atlas/threat" className="atlas-nb"><span className="atlas-nb-ico">T</span> Threat</Link>
            <Link href="/atlas/evidence" className="atlas-nb"><span className="atlas-nb-ico">E</span> Evidence</Link>
            <Link href="/rehearse/drone" className="atlas-nb"><span className="atlas-nb-ico">H</span> Rehearse</Link>

            <div className="atlas-ns">Commerce</div>
            <Link href="/portal" className="atlas-nb"><span className="atlas-nb-ico">P</span> Customer Portal</Link>
            <Link href="/pricing" className="atlas-nb"><span className="atlas-nb-ico">$</span> Pricing</Link>
            <Link href="/internal/account-manager" className="atlas-nb"><span className="atlas-nb-ico">C</span> Account Manager</Link>
          </aside>

          <section className="atlas-main">
            <div className="atlas-viewport">{children}</div>
          </section>
        </div>

        <footer className="atlas-statusbar">
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="atlas-sdot" style={{ background: "#22c55e" }} />
            <span>4 drones active</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="atlas-sdot" style={{ background: "#0891b2" }} />
            <span>NEPA STDP v3.2</span>
          </div>
          <span>Kowloon / HKCAD-B</span>
          <span className="atlas-sb-fit">ATLAS Fit <strong>87</strong>/100</span>
        </footer>
      </div>
    </div>
  );
}
