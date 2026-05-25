import React from "react";
import type { VehicleLinkPanelVM } from "@/lib/atlas/view-models-ardupilot";

interface Props {
  vm: VehicleLinkPanelVM;
}

const VehicleLinkSection: React.FC<Props> = ({ vm }) => (
  <section>
    <h2 className="text-lg font-bold mb-2">{vm.title}</h2>
    {vm.subtitle && <div className="text-sm text-slate-400 mb-2">{vm.subtitle}</div>}
    {/* Render vehicle link info as needed */}
  </section>
);

export default VehicleLinkSection;
