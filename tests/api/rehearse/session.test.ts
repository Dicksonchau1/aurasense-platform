import request from 'supertest';
import { createServer } from 'http';
import app from '@/src/app'; // Adjust if using a custom Next.js server or API handler

describe('/api/rehearse/session', () => {
  it('401 without auth', async () => {
    const res = await request(app)
      .post('/api/rehearse/session')
      .send({ action: 'start', session_id: 's1', payload: {} });
    expect(res.status).toBe(401);
  });

  it('400 on invalid action', async () => {
    // Mock auth middleware to pass
    // ...implementation depends on your auth setup
    const res = await request(app)
      .post('/api/rehearse/session')
      .set('Authorization', 'Bearer test')
      .send({ action: 'invalid', session_id: 's1', payload: {} });
    expect(res.status).toBe(400);
  });

  it('successful start', async () => {
    // Mock dependencies and auth
    // ...implementation depends on your setup
    const res = await request(app)
      .post('/api/rehearse/session')
      .set('Authorization', 'Bearer test')
      .send({ action: 'start', session_id: 's1', payload: {/* valid context */} });
    expect([200, 201]).toContain(res.status);
  });

  it('successful tick', async () => {
    // ...mock as above
    const res = await request(app)
      .post('/api/rehearse/session')
      .set('Authorization', 'Bearer test')
      .send({ action: 'tick', session_id: 's1', payload: { context: {/* valid */}, telemetry: {/* valid */} } });
    expect([200, 201]).toContain(res.status);
  });

  it('successful end', async () => {
    // ...mock as above
    const res = await request(app)
      .post('/api/rehearse/session')
      .set('Authorization', 'Bearer test')
      .send({ action: 'end', session_id: 's1', payload: { context: {/* valid */} } });
    expect([200, 201]).toContain(res.status);
  });
});
