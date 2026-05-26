// Audit — immutable hash chain + Merkle tree summary.
// Frames are mock data; in production they come from AuditChainWriter via Supabase.
// All hashes computed deterministically with SHA-256 (node:crypto) at render time.

import { createHash } from "node:crypto";

interface AuditFrame {
  id: string;
  tick: number;
  actor: string;
  action: string;
  payloadHash: string;
  capturedAt: string;
}

interface ChainedFrame extends AuditFrame {
  prevHash: string;
  chainHash: string;
}

const RAW_FRAMES: Omit<AuditFrame, "payloadHash">[] = [
  { id: "af-001", tick: 0,    actor: "system",          action: "session.start",                 capturedAt: "2026-05-26T03:14:02Z" },
  { id: "af-002", tick: 32,   actor: "operator:dchau",  action: "mission.create:HK-COASTAL-07",  capturedAt: "2026-05-26T03:15:11Z" },
  { id: "af-003", tick: 64,   actor: "agent:drone-01",  action: "preflight.ok",                  capturedAt: "2026-05-26T03:15:48Z" },
  { id: "af-004", tick: 120,  actor: "agent:drone-01",  action: "takeoff",                       capturedAt: "2026-05-26T03:16:23Z" },
  { id: "af-005", tick: 480,  actor: "agent:drone-01",  action: "waypoint.reach:WP-03",          capturedAt: "2026-05-26T03:18:01Z" },
  { id: "af-006", tick: 720,  actor: "agent:drone-01",  action: "scan.lidar:start",              capturedAt: "2026-05-26T03:19:12Z" },
  { id: "af-007", tick: 1240, actor: "agent:drone-01",  action: "anomaly.detect:crack-A1",       capturedAt: "2026-05-26T03:21:33Z" },
  { id: "af-008", tick: 1280, actor: "supervisor:nepa", action: "review.flag:crack-A1",          capturedAt: "2026-05-26T03:21:41Z" },
  { id: "af-009", tick: 1900, actor: "agent:drone-01",  action: "rth.engage",                    capturedAt: "2026-05-26T03:24:02Z" },
  { id: "af-010", tick: 2100, actor: "agent:drone-01",  action: "landed",                        capturedAt: "2026-05-26T03:25:18Z" },
];

const GENESIS = "0".repeat(64);

function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

function buildChain(): ChainedFrame[] {
  const out: ChainedFrame[] = [];
  let prev = GENESIS;
  for (const f of RAW_FRAMES) {
    const payloadHash = sha256(
      JSON.stringify({ id: f.id, tick: f.tick, actor: f.actor, action: f.action, capturedAt: f.capturedAt }),
    );
    const chainHash = sha256(prev + payloadHash);
    out.push({ ...f, payloadHash, prevHash: prev, chainHash });
    prev = chainHash;
  }
  return out;
}

function buildMerkleRoot(leaves: string[]): { root: string; depth: number } {
  if (leaves.length === 0) return { root: GENESIS, depth: 0 };
  let level = leaves.slice();
  let depth = 0;
  while (level.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const a = level[i];
      const b = i + 1 < level.length ? level[i + 1] : level[i];
      next.push(sha256(a + b));
    }
    level = next;
    depth += 1;
  }
  return { root: level[0], depth };
}

function shortHash(h: string): string {
  return h.length <= 14 ? h : `${h.slice(0, 8)}…${h.slice(-4)}`;
}

export default function AuditPage() {
  const chain = buildChain();
  const merkle = buildMerkleRoot(chain.map((c) => c.chainHash));
  const tip = chain[chain.length - 1]?.chainHash ?? GENESIS;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <header>
        <h1 style={{ fontSize: 22, margin: 0 }}>Audit Trail</h1>
        <p style={{ opacity: 0.6, margin: "4px 0 0", fontSize: 13 }}>
          Immutable hash chain with Merkle root anchor. SHA-256, append-only.
        </p>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        {[
          { k: "Frames", v: chain.length },
          { k: "Merkle depth", v: merkle.depth },
          { k: "Chain tip", v: shortHash(tip), mono: true },
          { k: "Merkle root", v: shortHash(merkle.root), mono: true },
        ].map((c) => (
          <div
            key={c.k}
            style={{
              padding: 12,
              border: "1px solid #1a1f26",
              borderRadius: 8,
              background: "#0e1217",
            }}
          >
            <div style={{ fontSize: 11, opacity: 0.6 }}>{c.k}</div>
            <div
              style={{
                fontSize: c.mono ? 14 : 22,
                fontWeight: 700,
                marginTop: 4,
                fontFamily: c.mono ? "monospace" : undefined,
              }}
            >
              {c.v}
            </div>
          </div>
        ))}
      </section>

      <section
        style={{
          border: "1px solid #1a1f26",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead style={{ background: "#11151a", textAlign: "left" }}>
            <tr>
              <th style={{ padding: "8px 10px" }}>#</th>
              <th style={{ padding: "8px 10px" }}>Tick</th>
              <th style={{ padding: "8px 10px" }}>Actor</th>
              <th style={{ padding: "8px 10px" }}>Action</th>
              <th style={{ padding: "8px 10px" }}>Payload</th>
              <th style={{ padding: "8px 10px" }}>Prev</th>
              <th style={{ padding: "8px 10px" }}>Chain</th>
              <th style={{ padding: "8px 10px" }}>At</th>
            </tr>
          </thead>
          <tbody>
            {chain.map((f, i) => (
              <tr key={f.id} style={{ borderTop: "1px solid #1a1f26" }}>
                <td style={{ padding: "8px 10px", opacity: 0.6 }}>{i + 1}</td>
                <td style={{ padding: "8px 10px", fontFamily: "monospace" }}>{f.tick}</td>
                <td style={{ padding: "8px 10px" }}>{f.actor}</td>
                <td style={{ padding: "8px 10px", fontFamily: "monospace" }}>{f.action}</td>
                <td style={{ padding: "8px 10px", fontFamily: "monospace", opacity: 0.85 }}>
                  {shortHash(f.payloadHash)}
                </td>
                <td style={{ padding: "8px 10px", fontFamily: "monospace", opacity: 0.5 }}>
                  {shortHash(f.prevHash)}
                </td>
                <td style={{ padding: "8px 10px", fontFamily: "monospace", color: "#22d3ee" }}>
                  {shortHash(f.chainHash)}
                </td>
                <td style={{ padding: "8px 10px", opacity: 0.7 }}>
                  {new Date(f.capturedAt).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section
        style={{
          padding: 12,
          border: "1px solid #1a1f26",
          borderRadius: 8,
          background: "#0e1217",
          fontSize: 12,
          opacity: 0.85,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Anchoring</div>
        <div style={{ fontFamily: "monospace" }}>
          merkle_root = {merkle.root}
          <br />
          tip = {tip}
        </div>
        <div style={{ opacity: 0.6, marginTop: 6 }}>
          The Merkle root above is the integrity anchor that gets mirrored to the
          Alerts service. Any tamper of an earlier frame invalidates every chain hash
          downstream.
        </div>
      </section>
    </div>
  );
}