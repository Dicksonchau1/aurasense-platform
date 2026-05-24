// ATLAS ArduPilot view-models - Batch 2 stub
// Add real logic as needed for calibration and modes

export function getCalibrationPanelVM() {
  // TODO: Replace with real calibration VM logic
  return { calibrationStatus: "Not calibrated" };
}

export function getModesPanelVM() {
  // TODO: Replace with real modes VM logic
  return { availableModes: ["STABILIZE", "ALT_HOLD", "LOITER"], currentMode: "STABILIZE" };
}

// Batch 3: FailsafePanelVM and MissionCommandsPanelVM
import type { FailsafeState, MissionCommandsState, PolicyReceiptState, VehicleLinkState } from "./hooks-ardupilot";

export function getFailsafePanelVM(state: FailsafeState) {
  return {
    kpis: [
      { label: "Armed", value: state.armed ? "Yes" : "No" },
      { label: "Active Failsafes", value: Object.keys(state.failsafePolicies || {}).length.toString() },
      { label: "Last Trigger", value: state.lastTriggeredCause || "-" },
      { label: "Ack State", value: state.ackState || "-" },
    ],
    statusChips: Object.entries(state.failsafePolicies || {}).map(([key, value]: [string, string]) => ({
      label: key,
      tone: value === "critical" ? "critical" : value === "warning" ? "warning" : "success",
    })),
    timelineRows: (state.timeline || []).map((row: { cause: string; actor: string; timestamp: string }) => ({
      cause: row.cause,
      actor: row.actor,
      timestamp: row.timestamp,
    })),
    ackState: state.ackState,
  };
}

export function getMissionCommandsPanelVM(state: MissionCommandsState) {
  return {
    kpis: [
      { label: "Queued", value: (state.commandQueue || []).length.toString() },
      { label: "Last State", value: state.executionState || "-" },
      { label: "Last Error", value: state.lastError || "-" },
    ],
    statusChips: (state.commandQueue || []).map((cmd: { id: string; command: string; params: Record<string, unknown>; state: string; timestamp: string }) => ({
      label: cmd.command,
      tone: cmd.state === "acked" ? "success" : cmd.state === "rejected" ? "critical" : cmd.state === "timed-out" ? "warning" : "success",
    })),
    timelineRows: (state.commandHistory || []).map((cmd: { id: string; command: string; params: Record<string, unknown>; state: string; timestamp: string }) => ({
      event: cmd.command,
      actor: "operator",
      timestamp: cmd.timestamp,
    })),
    currentCommand: state.currentCommand,
  };
}

  // Batch 4: LogReplayPanelVM and WaypointExecutionPanelVM
  type LogReplayPanelVMState = {
    selectedLogId: string;
    playbackState: string;
    cursorTime: number;
    playbackRate: number;
    segmentMarkers: { label: string; timestamp: string }[];
  };
  export function getLogReplayPanelVM(state: LogReplayPanelVMState) {
    return {
      kpis: [
        { label: "Selected Log", value: state.selectedLogId || "-" },
        { label: "Playback State", value: state.playbackState },
        { label: "Cursor Time", value: state.cursorTime.toString() },
        { label: "Rate", value: state.playbackRate + "x" },
      ],
      statusChips: [
        { label: "Playback", tone: state.playbackState === "playing" ? "success" : state.playbackState === "paused" ? "warning" : "default" },
        { label: "Log Integrity", tone: state.selectedLogId ? "success" : "default" },
      ],
      timelineRows: (state.segmentMarkers || []).map((m: { label: string; timestamp: string }) => ({
        label: m.label,
        timestamp: m.timestamp,
      })),
      cursorTime: state.cursorTime,
      playbackState: state.playbackState,
      playbackRate: state.playbackRate,
      selectedLogId: state.selectedLogId,
      segmentMarkers: state.segmentMarkers,
    };
  }

  type Waypoint = { label: string };
  type WaypointExecutionPanelVMState = {
    missionWaypoints: Waypoint[];
    currentWaypointIndex: number;
    distanceToNext?: number;
    etaToNext?: number;
    deviationFromPath?: number;
    executionState: string;
    eventTimeline: { type: string; actor: string; timestamp: string; index?: number; reason?: string }[];
    lastWaypointEvent?: string;
  };
  export function getWaypointExecutionPanelVM(state: WaypointExecutionPanelVMState) {
    return {
      kpis: [
        { label: "Current Waypoint", value: (state.missionWaypoints[state.currentWaypointIndex]?.label || state.currentWaypointIndex + 1 || "-") },
        { label: "Distance to Next", value: state.distanceToNext != null ? state.distanceToNext + " m" : "-" },
        { label: "ETA to Next", value: state.etaToNext != null ? state.etaToNext + " s" : "-" },
        { label: "Deviation", value: state.deviationFromPath != null ? state.deviationFromPath + " m" : "-" },
      ],
      statusChips: (state.missionWaypoints || []).map((wp: Waypoint, i: number) => ({
        label: wp.label || `WP${i + 1}`,
        tone:
          i === state.currentWaypointIndex
            ? state.executionState === "en-route"
              ? "active"
              : state.executionState === "hold"
              ? "warning"
              : state.executionState === "aborted"
              ? "critical"
              : "success"
            : i < state.currentWaypointIndex
            ? "success"
            : "default",
      })),
      timelineRows: (state.eventTimeline || []).map((evt: { type: string; actor: string; timestamp: string; index?: number; reason?: string }) => ({
        event: evt.type,
        actor: evt.actor,
        timestamp: evt.timestamp,
        index: evt.index,
        reason: evt.reason,
      })),
      currentWaypointIndex: state.currentWaypointIndex,
      executionState: state.executionState,
      deviationFromPath: state.deviationFromPath,
      lastWaypointEvent: state.lastWaypointEvent,
    };
  }

// Batch 5: PolicyReceiptPanelVM and VehicleLinkPanelVM
export function getPolicyReceiptPanelVM(state: PolicyReceiptState) {
  return {
    kpis: [
      { label: "Policy Version", value: state.policyVersion || "-" },
      { label: "Last Ack", value: state.lastAck || "-" },
      { label: "Status", value: state.policyStatus || "-" },
    ],
    statusChips: [
      { label: state.policyStatus || "Unknown", tone: state.policyStatus === "Active" ? "success" : state.policyStatus === "Warning" ? "warning" : "critical" },
    ],
    timelineRows: (state.policyTimeline || []).map((row: { event: string; actor: string; timestamp: string }) => ({
      event: row.event,
      actor: row.actor,
      timestamp: row.timestamp,
    })),
    policyDocUrl: state.policyDocUrl,
  };
}

export function getVehicleLinkPanelVM(state: VehicleLinkState) {
  return {
    kpis: [
      { label: "Link Status", value: state.linkStatus || "-" },
      { label: "Last Ack", value: state.lastAck || "-" },
      { label: "Signal", value: state.signalStrength != null ? state.signalStrength + "%" : "-" },
    ],
    statusChips: [
      { label: state.linkStatus || "Unknown", tone: state.linkStatus === "Connected" ? "success" : state.linkStatus === "Degraded" ? "warning" : "critical" },
    ],
    timelineRows: (state.linkTimeline || []).map((row: { event: string; actor: string; timestamp: string }) => ({
      event: row.event,
      actor: row.actor,
      timestamp: row.timestamp,
    })),
    linkStatus: state.linkStatus,
  };
}

// Batch 6: ModelReleasePanelVM and OperatorIdentityPanelVM
type ModelRelease = {
  modelId: string;
  version: string;
  channel: string;
  releasedAt: string;
  integrityHash: string;
  deploymentState: string;
  performanceBaseline: string;
  regressionFlags: string[];
};
type ModelReleaseTimelineEvent = {
  event: string;
  actor: string;
  version: string;
  channel: string;
  timestamp: string;
  reason?: string;
};
type ModelReleasesState = {
  releases: ModelRelease[];
  activeReleaseId: string;
  comparisonReleaseId: string | null;
  rolloutState: string;
  lastAck: string | null;
  updatedAt: string;
  timeline: ModelReleaseTimelineEvent[];
};
export function getModelReleasePanelVM(state: ModelReleasesState) {
  const active = state.releases?.find((r: ModelRelease) => r.modelId === state.activeReleaseId);
  const comparison = state.releases?.find((r: ModelRelease) => r.modelId === state.comparisonReleaseId);
  return {
    kpis: [
      { label: "Active Version", value: active?.version || "-" },
      { label: "Rollout State", value: state.rolloutState || "-" },
      { label: "Regression Flags", value: (active?.regressionFlags?.length || 0).toString() },
      { label: "Integrity", value: active?.integrityHash || "-" },
    ],
    statusChips: state.releases?.map((r: ModelRelease) => ({
      label: r.deploymentState,
      tone: r.deploymentState as string,
    })) || [],
    timelineRows: (state.timeline || []).map((row: ModelReleaseTimelineEvent) => ({
      event: row.event,
      version: row.version,
      channel: row.channel,
      actor: row.actor,
      timestamp: row.timestamp,
    })),
    activeRelease: active,
    comparisonRelease: comparison,
    rolloutState: state.rolloutState,
  };
}

type Operator = {
  operatorId: string;
  displayName: string;
  role: string;
  clearanceLevel: string;
  sessionStartedAt: string;
};
type OperatorAction = {
  actor: string;
  action: string;
  target: string;
  timestamp: string;
};
type OperatorIdentityState = {
  currentOperator: Operator;
  activeSessions: Operator[];
  recentActions: OperatorAction[];
  authenticationState: string;
  lastEscalation: string | null;
  lastAck: string | null;
  updatedAt: string;
};
export function getOperatorIdentityPanelVM(state: OperatorIdentityState) {
  return {
    kpis: [
      { label: "Operator", value: state.currentOperator?.displayName || "-" },
      { label: "Role", value: state.currentOperator?.role || "-" },
      { label: "Clearance", value: state.currentOperator?.clearanceLevel || "-" },
      { label: "Auth State", value: state.authenticationState || "-" },
    ],
    statusChips: state.activeSessions?.map((s: Operator) => ({
      label: s.role,
      tone: state.authenticationState as string,
    })) || [],
    timelineRows: (state.recentActions || []).map((row: OperatorAction) => ({
      actor: row.actor,
      action: row.action,
      target: row.target,
      timestamp: row.timestamp,
    })),
    currentOperator: state.currentOperator,
    activeSessions: state.activeSessions,
    recentActions: state.recentActions,
    authenticationState: state.authenticationState,
  };
}
