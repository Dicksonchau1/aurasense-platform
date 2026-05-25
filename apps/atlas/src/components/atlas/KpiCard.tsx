import React from "react";

export interface KpiCardProps {
  label: string;
  value: string | number;
}

export const KpiCard: React.FC<KpiCardProps> = ({ label, value }) => (
  <div className="atlas-panel-soft p-4 flex flex-col items-start">
    <span className="text-xs text-slate-400 uppercase tracking-wider mb-2">{label}</span>
    <span className="text-2xl font-bold text-white">{value}</span>
  </div>
);
