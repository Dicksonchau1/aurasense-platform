import React from "react";
import type { ParametersPanelVM } from "@/lib/atlas/view-models-ardupilot";
import { getAuthErrorMessage } from "@/lib/atlas/errorUtils";

interface Props {
  vm: ParametersPanelVM | null;
  error?: string | null;
  loading?: boolean;
  onParameterChange?: (key: string, value: any) => void;
}

const ParametersSection: React.FC<Props> = ({ vm, error, loading, onParameterChange }) => {
  if (loading) return <section className="atlas-panel p-4 text-slate-400">Loading parameters…</section>;
  if (error) {
    const authMsg = getAuthErrorMessage(Number(error.match(/\d+/)?.[0]));
    return <section className="atlas-panel p-4 text-rose-400">{authMsg || error}</section>;
  }
  if (!vm) return <section className="atlas-panel p-4 text-rose-400">No parameter data.</section>;
  return (
    <section>
      <h2 className="text-lg font-bold mb-2">{vm.title}</h2>
      {vm.subtitle && <div className="text-sm text-slate-400 mb-2">{vm.subtitle}</div>}
      {/* Render parameters, rows, etc. as needed */}
    </section>
  );
};

export default ParametersSection;
