export interface RehearseSessionContext {
  session_id: string;
  run_id?: string;
  [key: string]: any;
}

export interface TelemetryFrame {
  ts: number;
  [key: string]: any;
}