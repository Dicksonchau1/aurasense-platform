// This interface matches the expected shape for HriSessionRepository.createSession
export interface HriSessionData {
  app_context: string;
  scenario_id?: string | null;
  mission_id?: string | null;
  operator_user_id?: string | null;
  agent_id: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}
