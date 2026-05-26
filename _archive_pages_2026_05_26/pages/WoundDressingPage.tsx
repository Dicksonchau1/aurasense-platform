import React from "react";
import WoundDressingRehearse from "../components/WoundDressingRehearse";

export default function WoundDressingPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", justifyContent: "center" }}>
      <h1>Wound Dressing Rehearsal</h1>
      <WoundDressingRehearse />
    </div>
  );
}
