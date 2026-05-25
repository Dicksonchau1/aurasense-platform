
import request from 'supertest';

// Use the running dev server at the specified base URL
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const agent = request(BASE_URL);

describe('MAVLink Command API', () => {
  let missionId: string;

  beforeAll(async () => {
    // Fetch a seeded mission ID from the running server
    const res = await agent.get('/api/atlas/missions');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.result)).toBe(true);
    missionId = res.body.result[0]?.id;
    expect(missionId).toBeDefined();
  });

  it('should accept a valid MAVLink command and log it', async () => {
    const command = {
      command: 'ARM',
      params: { custom: 1 }
    };
    const res = await agent
      .post(`/api/missions/${missionId}/command`)
      .send(command)
      .set('Accept', 'application/json');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.result).toHaveProperty('command');
    expect(res.body.result.command).toBe('ARM');
  });

  it('should reject an invalid MAVLink command', async () => {
    const command = { command: '' };
    const res = await agent
      .post(`/api/missions/${missionId}/command`)
      .send(command)
      .set('Accept', 'application/json');
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toBeDefined();
  });

  it('should log all sent commands in the command log', async () => {
    // Send a command
    await agent
      .post(`/api/missions/${missionId}/command`)
      .send({ command: 'TAKEOFF', params: { alt: 10 } })
      .set('Accept', 'application/json');
    // Fetch the command log
    const res = await agent
      .get(`/api/atlas/missions/${missionId}/command-log`)
      .set('Accept', 'application/json');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.result)).toBe(true);
    expect(res.body.result.some((entry: any) => entry.command === 'TAKEOFF')).toBe(true);
  });
});