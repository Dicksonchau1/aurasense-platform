import { useReducer } from 'react';
import { hriSessionReducer, createHriSessionInitialState, HriSessionAction } from '../state/hriSessionReducer';
import { HriSessionState } from '../types/HriSessionState';
import { HriRole } from '../types/HriRole';

export function useHriSession(sessionId: string, role: HriRole, startedAt: string): [HriSessionState, React.Dispatch<HriSessionAction>] {
  return useReducer(hriSessionReducer, createHriSessionInitialState(sessionId, role, startedAt));
}
