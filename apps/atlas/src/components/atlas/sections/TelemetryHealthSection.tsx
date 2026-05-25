import React from "react";
import type { TelemetryHealthPanelVM } from "@/lib/atlas/view-models-ardupilot";
import { getAuthErrorMessage } from "@/lib/atlas/errorUtils";


interface Props {
  vm: TelemetryHealthPanelVM | null;
  error?: string | null;
  loading?: boolean;
}


const TelemetryHealthSection: React.FC<Props> = ({ vm, error, loading }) => {
  if (loading) return <section className="atlas-panel p-4 text-slate-400">Loading telemetry…</section>;
  if (error) {
    const authMsg = getAuthErrorMessage(Number(error.match(/\d+/)?.[0]));
    return <section className="atlas-panel p-4 text-rose-400">{authMsg || error}</section>;
  }
  if (!vm) return <section className="atlas-panel p-4 text-rose-400">No telemetry data.</section>;
  return (
    <section>
      <h2 className="text-lg font-bold mb-2">{vm.title}</h2>
      {vm.subtitle && <div className="text-sm text-slate-400 mb-2">{vm.subtitle}</div>}
      {/* Render KPIs, chips, timeline, etc. as needed */}
    </section>
  );
};

export default TelemetryHealthSection;
