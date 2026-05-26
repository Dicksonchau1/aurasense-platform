"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  const error = params.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    setBusy(false);

    if (res?.ok) router.push(callbackUrl);
    else router.push(`/login?error=${encodeURIComponent(res?.error ?? "Invalid credentials")}`);
  }

  const cardStyle: React.CSSProperties = {
    width: 380,
    padding: 32,
    background: "#111827",
    borderRadius: 12,
    border: "1px solid #1f2937",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    background: "#0a0e15",
    border: "1px solid #1f2937",
    borderRadius: 6,
    color: "#e5e7eb",
    fontSize: 14,
    marginBottom: 12,
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 4,
  };

  const LabelTag = "label" as keyof JSX.IntrinsicElements;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui",
        background: "#0a0e15",
        color: "#e5e7eb",
      }}
    >
      <div style={cardStyle}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 0, marginBottom: 4 }}>ATLAS</h1>
        <p style={{ color: "#9ca3af", marginTop: 0, marginBottom: 24, fontSize: 14 }}>
          Sign in to your AuraSense console
        </p>

        {error && (
          <div
            style={{
              background: "#7f1d1d",
              color: "#fecaca",
              padding: 10,
              borderRadius: 6,
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={() => signIn("github", { callbackUrl })}
          style={{
            width: "100%",
            padding: "10px 14px",
            background: "#24292f",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 16,
          }}
        >
          Continue with GitHub
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "16px 0",
            color: "#6b7280",
            fontSize: 12,
          }}
        >
          <div style={{ flex: 1, height: 1, background: "#1f2937" }} />
          <span>or</span>
          <div style={{ flex: 1, height: 1, background: "#1f2937" }} />
        </div>

        <form onSubmit={handleCredentials}>
          <LabelTag style={labelStyle}>Email</LabelTag>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          <LabelTag style={labelStyle}>Password</LabelTag>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...inputStyle, marginBottom: 16 }}
          />

          <button
            type="submit"
            disabled={busy}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "#22d3ee",
              color: "#0a0e15",
              border: "none",
              borderRadius: 6,
              fontSize: 15,
              fontWeight: 600,
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.6 : 1,
            }}
          >
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 12, color: "#6b7280", textAlign: "center" }}>
          Dev mode: any email + non-empty password works.
        </p>
      </div>
    </main>
  );
}
