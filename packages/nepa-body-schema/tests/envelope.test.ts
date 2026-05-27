import { describe, it, expect } from 'vitest';
import { envelope } from '../src/websocket/publisher';

describe('envelope', () => {
  it('should create a valid envelope shape', () => {
    const env = envelope('/robots/robot-1/body_schema/state', 'robot-1' as any, { foo: 'bar' });
    expect(env).toHaveProperty('v', 1);
    expect(env).toHaveProperty('topic', '/robots/robot-1/body_schema/state');
    expect(env).toHaveProperty('robotId', 'robot-1');
    expect(env).toHaveProperty('payload');
    expect(env.payload).toEqual({ foo: 'bar' });
    expect(typeof env.ts).toBe('number');
  });
});
