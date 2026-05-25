// API route for hybrid learning session replay
import { NextApiRequest, NextApiResponse } from 'next';
import { replaySession, getAdaptationTraces } from 'hybrid-learning';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { sessionId } = req.query;
  if (!sessionId || typeof sessionId !== 'string') {
    res.status(400).json({ error: 'Missing sessionId' });
    return;
  }
  if (req.method === 'POST') {
    const decisions = replaySession(sessionId);
    res.status(200).json({ decisions });
  } else if (req.method === 'GET') {
    const traces = getAdaptationTraces(sessionId);
    res.status(200).json({ traces });
  } else {
    res.status(405).end();
  }
}
