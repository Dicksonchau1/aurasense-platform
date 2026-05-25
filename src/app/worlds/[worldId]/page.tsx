'use client';

import dynamic from "next/dynamic";
const MissionsManager = dynamic(() => import("@/components/missions/MissionsManager"), { ssr: false });

export default function WorldPage() {
  return (
    <div>
      <h1>World Details</h1>
      <MissionsManager />
    </div>
  );
}
