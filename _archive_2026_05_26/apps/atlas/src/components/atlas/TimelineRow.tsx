import React from "react";

export interface TimelineRowProps {
  label: string;
  value: string;
}

export const TimelineRow: React.FC<TimelineRowProps> = ({ label, value }) => (
  <div className="flex justify-between text-sm text-slate-300">
    <span>{label}</span>
    <span>{value}</span>
  </div>
);
