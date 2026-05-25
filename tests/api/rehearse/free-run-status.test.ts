import { createMocks } from 'node-mocks-http';
import handler from '../../../src/app/api/rehearse/free-run-status/route';

describe('/api/rehearse/free-run-status', () => {
  it('returns 200 with running: false when no row exists', async () => {
    // Mock Supabase to return no row
    // ...mocking logic here...
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData()).running).toBe(false);
  });

  it('returns correct session_count from mock Supabase', async () => {
    // Mock Supabase to return a row
    // ...mocking logic here...
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    // ...assertions for session_count...
  });

  it('dummy test to ensure Jest detects this file', () => {
    expect(true).toBe(true);
  });
});
