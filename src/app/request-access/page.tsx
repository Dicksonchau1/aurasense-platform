"use client";
import { useState } from "react";

export default function RequestAccess() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", org: "", reason: "" });

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nOrganisation: ${form.org}\n\nReason:\n${form.reason}`
    );
    window.location.href = `mailto:dickson@aurasensehk.com?subject=Playground Access Request — ${encodeURIComponent(form.name)}&body=${body}`;
    setSubmitted(true);
  }

  const inputStyle = {
    width: "100%", boxSizing: "border-box" as const,
    background: "#141a2a", border: "1px solid #1c2840", borderRadius: 6,
    padding: "10px 12px", color: "#dbe5f1", fontSize: 14,
    fontFamily: "system-ui, -apple-system, sans-serif",
    outline: "none",
  };
  const labelStyle = { display: "block", fontSize: 12, color: "#7dd4a0", marginBottom: 6, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" as const };

  if (submitted) {
    return (
      <main style={{ maxWidth: 600, margin: "0 auto", padding: "80px 24px", textAlign: "center", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h1 style={{ color: "#7dd4a0", fontSize: 28, marginBottom: 12 }}>Request sent</h1>
        <p style={{ color: "#9aa8b8", fontSize: 15 }}>
          Your mail client opened a pre-filled email to dickson@aurasensehk.com. If it didn't, email us directly with your name, organisation, and reason for access.
        </p>
        <a href="/" style={{ display: "inline-block", marginTop: 24, color: "#3dc8d8", fontSize: 14 }}>← Back to AuraSense</a>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "60px 24px", lineHeight: 1.6, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <a href="/" style={{ fontSize: 13, color: "#3dc8d8", textDecoration: "none", display: "inline-block", marginBottom: 32 }}>← AuraSense</a>

      <h1 style={{ color: "#ffd479", fontSize: 32, margin: "0 0 8px" }}>🔒 Request Playground Access</h1>
      <p style={{ color: "#9aa8b8", marginBottom: 36, fontSize: 15 }}>
        The clinical Playground trainer is invite-only. It uses your webcam to coach
        WHO 7-step hand hygiene with real-time STDP perception and HRI envelope scoring.
        We review requests manually and send an invite link within 1–2 business days.
      </p>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label style={labelStyle}>Full Name *</label>
          <input
            required
            value={form.name}
            onChange={e => update("name", e.target.value)}
            placeholder="Dr. Chan Tai Man"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Work Email *</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={e => update("email", e.target.value)}
            placeholder="you@hospital.org.hk"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Organisation</label>
          <input
            value={form.org}
            onChange={e => update("org", e.target.value)}
            placeholder="HA / PolyU / Partner name"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Why do you want access? *</label>
          <textarea
            required
            value={form.reason}
            onChange={e => update("reason", e.target.value)}
            placeholder="Briefly describe your clinical or research context..."
            rows={4}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        <button
          type="submit"
          style={{
            background: "#ffd479", color: "#1a1622", fontWeight: 700,
            padding: "12px 20px", borderRadius: 6, fontSize: 15,
            border: "none", cursor: "pointer", alignSelf: "flex-start",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Send Request →
        </button>

        <p style={{ fontSize: 12, color: "#6e7c8e", marginTop: -8 }}>
          Submitting opens your email client with a pre-filled message. No data is stored on this form.
        </p>
      </form>
    </main>
  );
}
