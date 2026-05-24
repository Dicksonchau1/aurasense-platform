"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Valid tokens are checked here. For production, move to a server action / Supabase lookup.
// For now, add invited token strings to this Set.
const VALID_TOKENS = new Set<string>([
  // "tok_abc123",  // example — add real tokens here or replace with Supabase lookup
]);

function PlaygroundInner() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<"checking" | "valid" | "invalid">("checking");

  useEffect(() => {
    // Brief delay so the check feels intentional, not a flash
    const t = setTimeout(() => {
      setStatus(VALID_TOKENS.has(token) ? "valid" : "invalid");
    }, 400);
    return () => clearTimeout(t);
  }, [token]);

  if (status === "checking") {
    return (
      <div style={center}>
        <div style={{ fontSize: 13, color: "#6e7c8e", fontFamily: "monospace" }}>Verifying invite…</div>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div style={{ ...center, flexDirection: "column", gap: 20, padding: 32 }}>
        <div style={{ fontSize: 56 }}>🔒</div>
        <h1 style={{ color: "#ffd479", fontSize: 28, margin: 0, fontFamily: "system-ui, -apple-system, sans-serif" }}>Invite Required</h1>
        <p style={{ color: "#9aa8b8", fontSize: 15, maxWidth: 420, textAlign: "center", lineHeight: 1.6, fontFamily: "system-ui, -apple-system, sans-serif", margin: 0 }}>
          The Playground clinical trainer is available to invited clinical and partner accounts only.
          {token && (
            <span style={{ display: "block", marginTop: 8, fontFamily: "monospace", fontSize: 12, color: "#6e7c8e" }}>
              Token <code style={{ color: "#ff7070" }}>{token.slice(0, 12)}…</code> was not recognised.
            </span>
          )}
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <a href="/request-access" style={btnPrimary}>Request Access →</a>
          <a href="/" style={btnSecondary}>← Back to AuraSense</a>
        </div>
        <p style={{ fontSize: 12, color: "#6e7c8e", fontFamily: "system-ui, -apple-system, sans-serif" }}>
          Already have an invite? Check your email for a link with a valid token.
        </p>
      </div>
    );
  }

  // ── VALID TOKEN ── render the trainer
  return (
    <div style={{ padding: "40px 24px", maxWidth: 1000, margin: "0 auto", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontFamily: "monospace", color: "#10b981", letterSpacing: "0.2em", textTransform: "uppercase" }}>Playground · Clinical Trainer</span>
        <span style={{ fontSize: 11, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", padding: "2px 8px", borderRadius: 20, fontFamily: "monospace" }}>🟢 LIVE</span>
      </div>
      <h1 style={{ color: "#dbe5f1", fontSize: 32, margin: "0 0 6px", fontWeight: 700 }}>WHO 7-Step Hand Hygiene</h1>
      <p style={{ color: "#9aa8b8", fontSize: 14, marginBottom: 32 }}>
        STDP perception · 8-lane pre-engine · HRI envelope coaching · Camera-enabled
      </p>

      {/* Camera / trainer placeholder — swap with actual HandwashTrainer component */}
      <div style={{
        background: "#141a2a", border: "2px dashed #1c2840", borderRadius: 12,
        minHeight: 420, display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 12, color: "#6e7c8e",
      }}>
        <div style={{ fontSize: 32 }}>📷</div>
        <div style={{ fontSize: 14, fontFamily: "monospace" }}>HandwashTrainer loading…</div>
        <div style={{ fontSize: 12 }}>Import your HandwashingModule component here</div>
      </div>

      <p style={{ marginTop: 24, fontSize: 12, color: "#6e7c8e" }}>
        Accessed via token · <a href="/" style={{ color: "#3dc8d8" }}>AuraSense NCM</a>
      </p>
    </div>
  );
}

const center: React.CSSProperties = {
  minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center",
};
const btnPrimary: React.CSSProperties = {
  textDecoration: "none", display: "inline-block",
  background: "#ffd479", color: "#1a1622", fontWeight: 700,
  padding: "10px 18px", borderRadius: 6, fontSize: 14,
  fontFamily: "system-ui, -apple-system, sans-serif",
};
const btnSecondary: React.CSSProperties = {
  textDecoration: "none", display: "inline-block",
  background: "transparent", color: "#9aa8b8", fontWeight: 500,
  padding: "10px 18px", borderRadius: 6, fontSize: 14, border: "1px solid #1c2840",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

export default function PlaygroundPage() {
  return (
    <Suspense fallback={<div style={{ ...center, color: "#6e7c8e", fontFamily: "monospace", fontSize: 13 }}>Loading…</div>}>
      <PlaygroundInner />
    </Suspense>
  );
}
