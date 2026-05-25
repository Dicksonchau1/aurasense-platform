import { describe, it, expect } from 'vitest';
import { createHriSessionInitialState, hriSessionReducer, HriSessionAction } from './hriSessionReducer';
import { HriRole } from '../types/HriRole';

describe('hriSessionReducer', () => {
  it('should start a session', () => {
    const state = createHriSessionInitialState('s1', 'operator', '2024-01-01T00:00:00Z');
    expect(state.sessionId).toBe('s1');
    expect(state.role).toBe('operator');
    expect(state.status).toBe('active');
  });

  it('should handle PERCEPTION_UPDATED', () => {
    const state = createHriSessionInitialState('s1', 'operator', '2024-01-01T00:00:00Z');
    const action: HriSessionAction = {
      type: 'PERCEPTION_UPDATED',
      payload: { summary: 'test', timestamp: '2024-01-01T00:01:00Z' },
    };
    const next = hriSessionReducer(state, action);
    expect(next.perception?.summary).toBe('test');
    expect(next.timeline.length).toBe(1);
  });

  it('should complete a session', () => {
    let state = createHriSessionInitialState('s1', 'operator', '2024-01-01T00:00:00Z');
    const action: HriSessionAction = {
      type: 'SESSION_COMPLETED',
      payload: { completedAt: '2024-01-01T01:00:00Z' },
    };
    state = hriSessionReducer(state, action);
    expect(state.status).toBe('completed');
    expect(state.completedAt).toBe('2024-01-01T01:00:00Z');
  });
});
