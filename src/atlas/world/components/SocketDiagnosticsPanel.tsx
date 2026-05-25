"use client";

import { useEffect, useState } from "react";
import Card from "@/components/shell/Card";
import type { WorldAdapter } from "../WorldAdapter";
import type { DroneState } from "../types";

export function SocketDiagnosticsPanel({ adapter }: { adapter: WorldAdapter }) {
  const [state, setState] = useState<DroneState>(() => adapter.getState());
  const [lastMessageAt, setLastMessageAt] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setState(adapter.getState());

      if ("isConnected" in adapter && typeof (adapter as { isConnected?: () => boolean }).isConnected === "function") {
        setConnected((adapter as { isConnected?: () => boolean }).isConnected?.() ?? false);
      }

      if (
        "getLastMessageAt" in adapter &&
        typeof (adapter as { getLastMessageAt?: () => number | null }).getLastMessageAt === "function"
      ) {
        setLastMessageAt(
          (adapter as { getLastMessageAt?: () => number | null }).getLastMessageAt?.() ?? null
        );
      }
    }, 250);

    return () => window.clearInterval(id);
  }, [adapter]);

  return (
    <Card title="Socket diagnostics">
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">status</div>
            <div className="mt-2 font-mono text-[var(--text)]">
              {connected ? "connected" : "disconnected"}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">last message</div>
            <div className="mt-2 font-mono text-[var(--text)]">
              {lastMessageAt ? new Date(lastMessageAt).toLocaleTimeString() : "—"}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">parsed pose</div>
          <pre className="overflow-x-auto text-xs text-cyan-100">
{JSON.stringify(state.pose, null, 2)}
          </pre>
        </div>
      </div>
    </Card>
  );
}
