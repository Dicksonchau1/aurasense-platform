import React from "react";

// Types for props
interface LogReplaySectionProps {
  vm: any;
  onSelectLog: (logId: string) => void;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (timestamp: number) => void;
  onStep: (deltaMs: number) => void;
  onSetRate: (multiplier: number) => void;
  onAddMarker: (label: string, timestamp: number) => void;
  onAcknowledge: (operator: string) => void;
}

const LogReplaySection: React.FC<LogReplaySectionProps> = ({
  vm,
  onSelectLog,
  onPlay,
  onPause,
  onSeek,
  onStep,
  onSetRate,
  onAddMarker,
  onAcknowledge,
}) => {
  return (
    <section>
      <h2>Log Replay</h2>
      {/* KPI Grid */}
      <div className="kpi-grid">
        {vm.kpis.map((kpi: any) => (
          <div key={kpi.label} className="kpi-card">
            <strong>{kpi.label}</strong>
            <div>{kpi.value}</div>
          </div>
        ))}
      </div>
      {/* Log Selector */}
      <div>
        <label>Select Log: </label>
        <select
          value={vm.selectedLogId || ""}
          onChange={e => onSelectLog(e.target.value)}
          title="Select log file"
        >
          <option value="">--</option>
          {(vm.availableLogs || []).map((log: any) => (
            <option key={log.id} value={log.id}>{log.label || log.id}</option>
          ))}
        </select>
      </div>
      {/* Playback Controls */}
      <div className="playback-controls">
        <button onClick={onPlay} disabled={vm.playbackState === "playing"}>Play</button>
        <button onClick={onPause} disabled={vm.playbackState !== "playing"}>Pause</button>
        <button onClick={() => onStep(-1000)}>&lt;&lt; Step Back</button>
        <button onClick={() => onStep(1000)}>Step Forward &gt;&gt;</button>
        <label>Rate: </label>
        <input
          type="number"
          min={0.1}
          max={10}
          step={0.1}
          value={vm.playbackRate}
          onChange={e => onSetRate(Number(e.target.value))}
          title="Playback rate"
          placeholder="Playback rate"
        />
      </div>
      {/* Scrub Bar */}
      <div>
        <label>Cursor Time: </label>
        <input
          type="range"
          min={0}
          max={vm.maxTime || 100000}
          value={vm.cursorTime}
          onChange={e => onSeek(Number(e.target.value))}
          title="Cursor time scrub bar"
        />
        <span>{vm.cursorTime} ms</span>
      </div>
      {/* Segment Timeline & Marker List */}
      <div>
        <h4>Markers</h4>
        <ul>
          {(vm.segmentMarkers || []).map((m: any, i: number) => (
            <li key={i}>{m.label} @ {m.timestamp} ms</li>
          ))}
        </ul>
        <button onClick={() => onAddMarker("New Marker", vm.cursorTime)}>Add Marker</button>
      </div>
      {/* Status Chips */}
      <div className="status-chips">
        {vm.statusChips.map((chip: any, i: number) => (
          <span key={i} className={`chip chip-${chip.tone}`}>{chip.label}</span>
        ))}
      </div>
      {/* Acknowledge */}
      <div>
        <button onClick={() => onAcknowledge("operator")}>Acknowledge</button>
      </div>
    </section>
  );
};

export default LogReplaySection;
