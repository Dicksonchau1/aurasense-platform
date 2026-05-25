

import { useEffect, useState } from "react";
import { logError, fetchWithRetry, getAuthErrorMessage } from "./errorUtils";
import { emitEnvelopeToNepa, Envelope } from "./envelope";
import type {
  CalibrationPanelVM,
  ModesPanelVM,
  TelemetryHealthPanelVM,
} from "./view-models-ardupilot";

// --- Minimal viable type exports for view-models-ardupilot.ts ---
export interface PayloadControlState { [key: string]: any }
export interface ProcedureChecklistState { items: ProcedureChecklistItem[] }
export interface ProcedureChecklistItem { id: string; label: string; checked: boolean }
export interface MissionTimelineState { events: MissionTimelineEvent[] }
export interface MissionTimelineEvent { id: string; type: string; timestamp: string }
export interface EvidenceBundleState { evidence: any[] }
export interface OperatorHandoverState { items: OperatorHandoverItem[] }
export interface OperatorHandoverItem { id: string; label: string; completed: boolean }
export interface MissionSummaryState { summary: string }
export interface DecisionLedgerState { entries: DecisionLedgerEntry[] }
export interface DecisionLedgerEntry { id: string; decision: string; timestamp: string }
export interface MissionDebriefState { tags: MissionDebriefTag[] }
export interface MissionDebriefTag { id: string; label: string }


const defaultState = {};
const defaultActions = {};
const now = () => new Date();

// --- Telemetry Health ---
export function useArduPilotTelemetryHealth() {
  const [state, setState] = useState<TelemetryHealthPanelVM | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date>(now());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // --- DEMO: Emit a sample envelope to NEPA on mount ---
    const demoEnvelope: Envelope = {
      envelope_id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      world_id: "demo-world",
      agent_id: "demo-agent",
      event_type: "telemetry_health_check",
      payload: { status: "ok", subsystem: "ardupilot" },
      meta: { source: "atlas", tags: ["demo"] },
      version: "1.0"
    };
    emitEnvelopeToNepa(demoEnvelope);
    setError(null);
    fetchWithRetry("/api/telemetry/health")
      .then(async res => {
        if (!res.ok) {
          const authMsg = getAuthErrorMessage(res.status);
          if (authMsg) setError(authMsg);
          else setError(`Failed to load telemetry health: HTTP ${res.status}`);
          logError(`Telemetry API error: ${res.status}`, "useArduPilotTelemetryHealth");
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setState({
          title: data.title || "Telemetry Health",
          subtitle: data.subtitle || "",
          kpis: data.kpis || [
            { label: "Signal", value: "Good" },
            { label: "Latency", value: "42ms" },
            { label: "Packets", value: "1234" },
          ],
          chips: data.chips || [
            { label: "Connected", color: "success" },
          ],
          rows: data.rows || [],
          timeline: data.timeline || [],
          warnings: data.warnings || [],
          lastAck: data.lastAck || null,
          meta: data.meta || {},
        });
        setUpdatedAt(now());
        setLoading(false);
      })
      .catch(e => {
        if (cancelled) return;
        setError(e.message);
        logError(e, "useArduPilotTelemetryHealth");
        // Fallback to mock data
        setState({
          title: "Telemetry Health (Mock)",
          subtitle: "No live data available",
          kpis: [
            { label: "Signal", value: "Mock" },
            { label: "Latency", value: "N/A" },
            { label: "Packets", value: "N/A" },
          ],
          chips: [
            { label: "Disconnected", color: "error" },
          ],
          rows: [],
          timeline: [],
          warnings: ["No connection to telemetry endpoint"],
          lastAck: null,
          meta: {},
        });
        setUpdatedAt(now());
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    state,
    loading,
    error,
    updatedAt,
  };
}

// --- Parameters ---

export function useArduPilotParameters() {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date>(now());

  // Update parameter action (real API call)
  const updateParameter = async (name: string, value: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithRetry("/api/telemetry/parameters", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, value }),
      });
      if (!res.ok) {
        const authMsg = getAuthErrorMessage(res.status);
        setError(authMsg || `Failed to update parameter: HTTP ${res.status}`);
        logError(`Parameters PATCH error: ${res.status}`, "useArduPilotParameters");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setState(data);
      setUpdatedAt(now());
    } catch (e: any) {
      setError(e.message);
      logError(e, "useArduPilotParameters");
    }
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchWithRetry("/api/telemetry/parameters")
      .then(async res => {
        if (!res.ok) {
          const authMsg = getAuthErrorMessage(res.status);
          setError(authMsg || `Failed to load parameters: HTTP ${res.status}`);
          logError(`Parameters GET error: ${res.status}`, "useArduPilotParameters");
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setState({
          title: data.title || "Parameters",
          subtitle: data.subtitle || "",
          kpis: data.kpis || [
            { label: "Max Altitude", value: "120m" },
            { label: "RTL Altitude", value: "30m" },
          ],
          chips: data.chips || [],
          rows: data.rows || [],
          timeline: data.timeline || [],
          warnings: data.warnings || [],
          lastAck: data.lastAck || null,
          meta: data.meta || {},
        });
        setUpdatedAt(now());
        setLoading(false);
      })
      .catch(e => {
        if (cancelled) return;
        setError(e.message);
        logError(e, "useArduPilotParameters");
        setState({
          title: "Parameters (Mock)",
          subtitle: "No live data available",
          kpis: [
            { label: "Max Altitude", value: "Mock" },
            { label: "RTL Altitude", value: "Mock" },
          ],
          chips: [],
          rows: [],
          timeline: [],
          warnings: ["No connection to parameters endpoint"],
          lastAck: null,
          meta: {},
        });
        setUpdatedAt(now());
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return {
    state,
    updateParameter,
    loading,
    error,
    updatedAt,
  };
}

// --- Calibration ---

export function useArduPilotCalibration() {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date>(now());

  // Calibrate action (real API call)
  const calibrate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/telemetry/calibration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setState(data);
      setUpdatedAt(now());
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch("/api/telemetry/calibration")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (cancelled) return;
        setState({
          title: data.title || "Calibration",
          subtitle: data.subtitle || "",
          kpis: data.kpis || [
            { label: "Gyro Bias", value: "0.01" },
            { label: "Accel Bias", value: "0.02" },
          ],
          chips: data.chips || [],
          rows: data.rows || [],
          timeline: data.timeline || [],
          warnings: data.warnings || [],
          lastAck: data.lastAck || null,
          meta: data.meta || {},
        });
        setUpdatedAt(now());
        setLoading(false);
      })
      .catch(e => {
        if (cancelled) return;
        setError(e.message);
        setState({
          title: "Calibration (Mock)",
          subtitle: "No live data available",
          kpis: [
            { label: "Gyro Bias", value: "Mock" },
            { label: "Accel Bias", value: "Mock" },
          ],
          chips: [],
          rows: [],
          timeline: [],
          warnings: ["No connection to calibration endpoint"],
          lastAck: null,
          meta: {},
        });
        setUpdatedAt(now());
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return {
    state,
    calibrate,
    loading,
    error,
    updatedAt,
  };
}

// --- Modes ---
export function useArduPilotModes(): { state: any; setMode: () => void; updatedAt: Date } {
  return {
    state: defaultState,
    setMode: () => {},
    updatedAt: now(),
  };
}

// --- Failsafe ---
export function useArduPilotFailsafe() {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date>(now());

  // Trigger/clear failsafe actions (real API calls)
  const triggerFailsafe = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/telemetry/failsafe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trigger" }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setState(data);
      setUpdatedAt(now());
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };
  const clearFailsafe = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/telemetry/failsafe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setState(data);
      setUpdatedAt(now());
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch("/api/telemetry/failsafe")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (cancelled) return;
        setState(data);
        setUpdatedAt(now());
        setLoading(false);
      })
      .catch(e => {
        if (cancelled) return;
        setError(e.message);
        setState({
          title: "Failsafe (Mock)",
          subtitle: "No live data available",
          kpis: [
            { label: "Failsafe State", value: "Mock" },
          ],
          chips: [],
          rows: [],
          timeline: [],
          warnings: ["No connection to failsafe endpoint"],
          lastAck: null,
          meta: {},
        });
        setUpdatedAt(now());
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return {
    state,
    triggerFailsafe,
    clearFailsafe,
    loading,
    error,
    updatedAt,
  };
}

// --- Mission Commands ---

export function useArduPilotMissionCommands() {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date>(now());

  // Send command action (real API call)
  const sendCommand = async (command: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/telemetry/mission-commands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setState(data);
      setUpdatedAt(now());

        // --- Emit envelope to NEPA for real mission command ---
        try {
          const envelope = {
            envelope_id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            world_id: data.world_id || "unknown-world",
            agent_id: data.agent_id || "unknown-agent",
            event_type: "mission_command",
            payload: { command, result: data },
            meta: { source: "atlas", tags: ["mission"] },
            version: "1.0"
          };
          // Use the correct NEPA port (8001)
          const axios = await import("axios");
          await axios.default.post("http://localhost:8001/envelope", envelope);
        } catch (err) {
          // Optionally log error
          console.error("Failed to emit mission command envelope to NEPA:", err);
        }
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch("/api/telemetry/mission-commands")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (cancelled) return;
        setState({
          title: data.title || "Mission Commands",
          subtitle: data.subtitle || "",
          kpis: data.kpis || [
            { label: "Commands Sent", value: "0" },
          ],
          chips: data.chips || [],
          rows: data.rows || [],
          timeline: data.timeline || [],
          warnings: data.warnings || [],
          lastAck: data.lastAck || null,
          meta: data.meta || {},
        });
        setUpdatedAt(now());
        setLoading(false);
      })
      .catch(e => {
        if (cancelled) return;
        setError(e.message);
        setState({
          title: "Mission Commands (Mock)",
          subtitle: "No live data available",
          kpis: [
            { label: "Commands Sent", value: "Mock" },
          ],
          chips: [],
          rows: [],
          timeline: [],
          warnings: ["No connection to mission commands endpoint"],
          lastAck: null,
          meta: {},
        });
        setUpdatedAt(now());
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return {
    state,
    sendCommand,
    loading,
    error,
    updatedAt,
  };
}

// --- Waypoint Execution ---

export function useArduPilotWaypointExecution() {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date>(now());

  // Execute/abort waypoint actions (real API calls)
  const executeWaypoint = async (waypoint: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/telemetry/waypoint-execution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "execute", waypoint }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setState(data);
      setUpdatedAt(now());
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };
  const abortWaypoint = async (waypoint: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/telemetry/waypoint-execution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "abort", waypoint }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setState(data);
      setUpdatedAt(now());
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch("/api/telemetry/waypoint-execution")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (cancelled) return;
        setState({
          title: data.title || "Waypoint Execution",
          subtitle: data.subtitle || "",
          kpis: data.kpis || [
            { label: "Waypoints Completed", value: "0" },
          ],
          chips: data.chips || [],
          rows: data.rows || [],
          timeline: data.timeline || [],
          warnings: data.warnings || [],
          lastAck: data.lastAck || null,
          meta: data.meta || {},
        });
        setUpdatedAt(now());
        setLoading(false);
      })
      .catch(e => {
        if (cancelled) return;
        setError(e.message);
        setState({
          title: "Waypoint Execution (Mock)",
          subtitle: "No live data available",
          kpis: [
            { label: "Waypoints Completed", value: "Mock" },
          ],
          chips: [],
          rows: [],
          timeline: [],
          warnings: ["No connection to waypoint execution endpoint"],
          lastAck: null,
          meta: {},
        });
        setUpdatedAt(now());
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return {
    state,
    executeWaypoint,
    abortWaypoint,
    loading,
    error,
    updatedAt,
  };
}

// --- Log Replay ---
export function useArduPilotLogReplay() {
  return {
    state: defaultState,
    startReplay: () => {},
    stopReplay: () => {},
    updatedAt: now(),
  };
}

// --- Policy Receipts ---
export function useArduPilotPolicyReceipts() {
  return {
    state: defaultState,
    acknowledgeReceipt: () => {},
    updatedAt: now(),
  };
}

// --- Vehicle Link ---
export function useArduPilotVehicleLink() {
  return {
    state: defaultState,
    connect: () => {},
    disconnect: () => {},
    updatedAt: now(),
  };
}

// --- Mission Fence ---
export function useArduPilotMissionFence() {
  return {
    state: defaultState,
    setFence: () => {},
    clearFence: () => {},
    updatedAt: now(),
  };
}

// --- Recovery Actions ---
export function useArduPilotRecoveryActions() {
  return {
    state: defaultState,
    recover: () => {},
    updatedAt: now(),
  };
}

// --- Decision Ledger ---
export function useArduPilotDecisionLedger() {
  return {
    state: defaultState,
    logDecision: () => {},
    updatedAt: now(),
  };
}

// --- Evidence Export ---
export function useArduPilotEvidenceExport() {
  return {
    state: defaultState,
    exportEvidence: () => {},
    updatedAt: now(),
  };
}

// --- External Disclosure ---
export function useArduPilotExternalDisclosure() {
  return {
    state: defaultState,
    disclose: () => {},
    updatedAt: now(),
  };
}

// --- Mission Debrief ---
export function useArduPilotMissionDebrief() {
  return {
    state: defaultState,
    debrief: () => {},
    updatedAt: now(),
  };
}
