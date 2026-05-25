import React from "react";

export interface TimelineRowProps {
  label: string;
  value: string;
}

export const TimelineList: React.FC<{ rows: TimelineRowProps[] }> = ({ rows }) => (
  <div>
    {rows.map((row, i) => (
      <div key={i} className="flex justify-between text-sm text-slate-300">
        <span>{row.label}</span>
        <span>{row.value}</span>
      </div>
    ))}
  </div>
);
