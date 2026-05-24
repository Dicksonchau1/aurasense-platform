import React from "react";

// Types for props
interface WaypointExecutionSectionProps {
  vm: any;
  onSkipToWaypoint: (index: number) => void;
  onHoldAtCurrent: () => void;
  onResumeMission: () => void;
  onAbortMission: (reason: string) => void;
  onAcknowledge: (operator: string) => void;
}

const WaypointExecutionSection: React.FC<WaypointExecutionSectionProps> = ({
  vm,
  onSkipToWaypoint,
  onHoldAtCurrent,
  onResumeMission,
  onAbortMission,
  onAcknowledge,
}) => {
  return (
    <section>
      <h2>Waypoint Execution</h2>
      {/* KPI Grid */}
      <div className="kpi-grid">
        {vm.kpis.map((kpi: any) => (
          <div key={kpi.label} className="kpi-card">
            <strong>{kpi.label}</strong>
            <div>{kpi.value}</div>
          </div>
        ))}
      </div>
      {/* Waypoint List with State Chips */}
      <div>
        <h4>Waypoints</h4>
        <ul className="waypoint-list">
          {(vm.statusChips || []).map((chip: any, i: number) => (
            <li key={i}>
              <span className={`chip chip-${chip.tone}`}>{chip.label}</span>
              <button onClick={() => onSkipToWaypoint(i)}>Skip To</button>
            </li>
          ))}
        </ul>
      </div>
      {/* Active Waypoint Card */}
      <div>
        <h4>Active Waypoint</h4>
        <div className="active-waypoint-card">
          {vm.kpis[0]?.value}
        </div>
      </div>
      {/* Deviation Indicator */}
      <div>
        <label>Deviation: </label>
        <span>{vm.deviationFromPath != null ? vm.deviationFromPath + " m" : "-"}</span>
      </div>
      {/* Mission Control Buttons */}
      <div className="mission-controls">
        <button onClick={onHoldAtCurrent} disabled={vm.executionState === "hold"}>Hold</button>
        <button onClick={onResumeMission} disabled={vm.executionState !== "hold"}>Resume</button>
        <button onClick={() => onAbortMission("operator abort")}>Abort</button>
      </div>
      {/* Waypoint Event Timeline */}
      <div>
        <h4>Waypoint Events</h4>
        <ul>
          {(vm.timelineRows || []).map((evt: any, i: number) => (
            <li key={i}>
              {evt.event} by {evt.actor} at {evt.timestamp}
              {evt.reason ? ` (${evt.reason})` : ""}
            </li>
          ))}
        </ul>
      </div>
      {/* Acknowledge */}
      <div>
        <button onClick={() => onAcknowledge("operator")}>Acknowledge</button>
      </div>
    </section>
  );
};

export default WaypointExecutionSection;
