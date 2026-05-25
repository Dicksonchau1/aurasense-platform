import React from "react";

interface Props {
  title: string;
  subtitle?: string;
}

export const MissionHeaderSection: React.FC<Props> = ({ title, subtitle }) => (
  <header>
    <h1 className="text-2xl font-bold mb-1">{title}</h1>
    {subtitle && <div className="text-base text-slate-400 mb-2">{subtitle}</div>}
  </header>
);

export default MissionHeaderSection;
