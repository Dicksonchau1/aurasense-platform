export type WorldStatus = 'active' | 'idle' | 'paused' | 'error';
export type AgentStatus = 'online' | 'offline' | 'busy';
export type RunStatus = 'queued' | 'running' | 'completed' | 'failed';
export type EventLevel = 'info' | 'warning' | 'error' | 'success';

export interface World {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: WorldStatus;
  region?: string;
  updatedAt: string;
  agentCount: number;
  activeRunCount: number;
  tags: string[];
}

export interface Agent {
  id: string;
  worldId: string;
  name: string;
  role: string;
  status: AgentStatus;
  model?: string;
  lastSeenAt: string;
  throughputPerMin?: number;
}

export interface RunEvent {
  id: string;
  runId: string;
  timestamp: string;
  level: EventLevel;
  source: string;
  message: string;
}

export interface Run {
  id: string;
  worldId: string;
  flowName: string;
  trigger: 'manual' | 'schedule' | 'agent' | 'api';
  status: RunStatus;
  startedAt: string;
  finishedAt?: string;
  initiatedBy?: string;
  progress: number;
  events: RunEvent[];
}

export interface DashboardSummary {
  worlds: number;
  activeAgents: number;
  runningFlows: number;
  failedRuns24h: number;
}
