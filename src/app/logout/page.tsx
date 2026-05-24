"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Card from "@/components/shell/Card";

export default function LogoutPage() {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setDone(true);
        setTimeout(() => router.push("/login"), 1200);
      } catch (e: any) {
        setErr(e?.message ?? "Sign out failed");
      }
    })();
  }, [router]);

  return (
    <div className="grid place-items-center min-h-[480px]">
      <Card className="w-full max-w-md text-center">
        <h1 className="aura-h1 mb-2">Signing out…</h1>
        {!done && !err && <p className="aura-sub">Clearing your session.</p>}
        {done && <p className="aura-sub">Done. Redirecting…</p>}
        {err && (
          <>
            <p className="aura-sub" style={{ color: "#7f1d1d" }}>{err}</p>
            <Link href="/login" className="aura-link block mt-4">Back to sign in</Link>
          </>
        )}
      </Card>
    </div>
  );
}
