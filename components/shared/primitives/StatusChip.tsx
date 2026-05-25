import React from "react";

export interface StatusChipProps {
  label: string;
  color?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ label, color }) => (
  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${color || 'bg-slate-600 text-white'}`}>
    {label}
  </span>
);