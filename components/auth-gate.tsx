import React from 'react';
import { useSession } from "next-auth/react";
import { AuthButton } from "./auth-button";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">Loading authentication...</div>;
  }

  if (!session) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
        <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">ATLAS access</p>
          <h1 className="mt-3 text-2xl font-semibold text-white">Sign in required</h1>
          <p className="mt-2 text-sm text-slate-400">Sign in to access the AuraSense platform.</p>
          <div className="mt-6 flex justify-center">
            <AuthButton />
          </div>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}
