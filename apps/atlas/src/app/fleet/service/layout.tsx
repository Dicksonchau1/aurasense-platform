import React from 'react';

export default function ServiceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full bg-slate-950 text-slate-100">
      {children}
    </div>
  );
}
