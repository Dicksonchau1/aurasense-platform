export default function Home() {
  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "60px 24px", lineHeight: 1.6, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <p style={{ fontSize: 11, fontFamily: "monospace", color: "#10b981", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>
        AuraSense · NCM
      </p>
      <h1 style={{ fontSize: 44, color: "#3dc8d8", margin: "0 0 12px", fontWeight: 700, letterSpacing: "-0.5px" }}>AuraSense NCM</h1>
      <p style={{ fontSize: 18, color: "#9aa8b8", marginBottom: 36, maxWidth: 620 }}>
        Neuromorphic Cognitive Middleware. A physical-world agent that anticipates and serves.
      </p>

      <p style={{ fontSize: 15, color: "#c5cfdb", maxWidth: 700, marginBottom: 0 }}>
        NCM is the cognitive overlay between the actuation layer and the controller. It decodes
        actuation into prediction, runs as a reflex tier with plastic STDP synapses, and buys
        upstream controllers the timestamp headroom they structurally cannot grow inside their
        own certification envelope. 10 W on a Jetson Nano. Offline-capable. Hash-chained.
      </p>

      <h2 style={{ marginTop: 56, color: "#7dd4a0", fontSize: 18, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Public Demos</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16, marginTop: 16 }}>
        <Card
          href="https://atlas.aurasensehk.com"
          title="Atlas · Rehearse-3D"
          desc="Kowloon demo tower with live HK sun, wind-corrected drone sweep, environmental physics."
        />
        <Card
          href="https://fleet.aurasensehk.com"
          title="Fleet Console"
          desc="Distributed NCM node view. STDP weights, world-model state, agent decisions across nodes."
        />
        <Card
          href="https://nepa-audit.aurasensehk.com/audit/recent"
          title="Audit Chain"
          desc="Hash-chained substrate events. Regulator-grade tamper-evident log."
        />
      </div>

      <h2 style={{ marginTop: 56, color: "#7dd4a0", fontSize: 18, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Restricted Access</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16, marginTop: 16 }}>
        <GatedCard
          title="Playground · Clinical Trainer"
          desc="WHO 7-step hand hygiene trainer with live STDP plasticity, 8-lane perception, HRI envelope coaching. Camera-enabled. Available to invited clinical and partner accounts only."
        />
      </div>

      <h2 style={{ marginTop: 56, color: "#7dd4a0", fontSize: 18, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Live Substrate Endpoints</h2>
      <ul style={{ fontFamily: "monospace", fontSize: 13, color: "#9aa8b8", lineHeight: 2.2, paddingLeft: 0, listStyle: "none" }}>
        <li>›&nbsp;<a href="https://nepa-stdp.aurasensehk.com/nepa/weights" style={{ color: "#3dc8d8" }}>STDP weight matrix</a> — plastic, drifts with use</li>
        <li>›&nbsp;<a href="https://nepa-wm.aurasensehk.com/wm/state" style={{ color: "#3dc8d8" }}>World model belief state</a></li>
        <li>›&nbsp;<a href="https://nepa-crew.aurasensehk.com/agents/decide" style={{ color: "#3dc8d8" }}>Agent crew decision</a></li>
        <li>›&nbsp;<a href="https://nepa-engine.aurasensehk.com/health" style={{ color: "#3dc8d8" }}>8-lane pre-engine</a></li>
      </ul>

      <footer style={{ marginTop: 80, paddingTop: 24, borderTop: "1px solid #1c2840", color: "#6e7c8e", fontSize: 12 }}>
        AuraSense · Kowloon, HK · 2026 · NCM v0.3
      </footer>
    </main>
  );
}

function Card({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <a href={href} style={{
      textDecoration: "none", color: "#dbe5f1",
      background: "#141a2a", border: "1px solid #1c2840", borderRadius: 10, padding: "18px 20px",
      display: "block", transition: "border-color 0.15s",
    }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#3dc8d8", marginBottom: 6 }}>{title} →</div>
      <div style={{ fontSize: 13, color: "#9aa8b8", lineHeight: 1.5 }}>{desc}</div>
    </a>
  );
}

function GatedCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{
      background: "#1a1622", border: "1px solid #3a2540", borderRadius: 10, padding: "18px 20px",
    }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#ffd479", marginBottom: 6 }}>🔒 {title}</div>
      <div style={{ fontSize: 13, color: "#9aa8b8", lineHeight: 1.5, marginBottom: 14 }}>{desc}</div>
      <a href="/request-access" style={{
        textDecoration: "none", display: "inline-block",
        background: "#ffd479", color: "#1a1622", fontWeight: 700,
        padding: "9px 16px", borderRadius: 6, fontSize: 13,
      }}>
        Request Access →
      </a>
    </div>
  );
}
