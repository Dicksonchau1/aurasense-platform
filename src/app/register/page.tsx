"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Card from "@/components/shell/Card";
import Field from "@/components/shell/Field";
import Button from "@/components/shell/Button";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setMsg("Check your inbox to confirm your email. You can sign in after confirming.");
    } catch (e: any) {
      setErr(e?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid place-items-center min-h-[480px]">
      <Card className="w-full max-w-md">
        <h1 className="aura-h1 mb-1">Create account</h1>
        <p className="aura-sub mb-5">One account for Rehearse-3D, ATTAS, and Robotics.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field
            name="email"
            label="Email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
          <Field
            name="password"
            label="Password (min 8 chars)"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          {err && (
            <div className="aura-panel" style={{ background: "rgba(185,28,28,0.08)", borderColor: "rgba(185,28,28,0.2)", color: "#7f1d1d" }}>
              {err}
            </div>
          )}
          {msg && (
            <div className="aura-panel" style={{ background: "rgba(46,125,82,0.1)", borderColor: "rgba(46,125,82,0.25)", color: "#14532d" }}>
              {msg}
            </div>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>
        <p className="aura-sub text-center mt-5">
          Already have an account? <Link href="/login" className="aura-link">Sign in</Link>
        </p>
      </Card>
    </div>
  );
}
