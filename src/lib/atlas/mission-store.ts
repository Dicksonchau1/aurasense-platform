// STUB - mission and command log. Wire to real Supabase mission_envelopes.
// Created during recovery on 2026-05-26.

export interface Mission {
  id: string;
  site_id: string;
  skill_id: string;
  started_at: string;
  ended_at: string | null;
  status: 'planned' | 'flying' | 'complete' | 'aborted';
}

export interface CommandLogEntry {
  id: string;
  mission_id: string;
  ts: string;
  command: string;
  operator: string;
}

const missions: Mission[] = [];
const commands: CommandLogEntry[] = [];

export function getAllMissions(): Mission[] { return missions; }
export function getCommandLog(): CommandLogEntry[] { return commands; }

export default { getAllMissions, getCommandLog };