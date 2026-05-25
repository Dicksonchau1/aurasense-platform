import React from "react";
import type { ParametersPanelVM } from "@/lib/atlas/view-models-ardupilot";

interface Props {
  vm: ParametersPanelVM;
  onParameterChange?: (key: string, value: any) => void;
}

const ParametersSection: React.FC<Props> = ({ vm, onParameterChange }) => (
  <section>
    <h2 className="text-lg font-bold mb-2">{vm.title}</h2>
    {vm.subtitle && <div className="text-sm text-slate-400 mb-2">{vm.subtitle}</div>}
    {/* Render parameters, rows, etc. as needed */}
  </section>
);

export default ParametersSection;
