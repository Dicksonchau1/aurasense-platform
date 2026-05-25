import { NextApiRequest, NextApiResponse } from 'next';

// In-memory state for failsafe
let failsafeActive = false;
let timeline: any[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json({
      title: 'Failsafe',
      subtitle: '',
      kpis: [
        { label: 'Failsafe State', value: failsafeActive ? 'Active' : 'Inactive' },
      ],
      chips: failsafeActive ? [{ label: 'Active', color: 'error' }] : [{ label: 'Inactive', color: 'success' }],
      rows: [],
      timeline,
      warnings: failsafeActive ? ['Failsafe is currently active!'] : [],
      lastAck: null,
      meta: {},
    });
  } else if (req.method === 'POST') {
    const { action } = req.body;
    if (action === 'trigger') {
      failsafeActive = true;
      timeline.push({ event: 'Failsafe Triggered', timestamp: new Date().toISOString() });
    } else if (action === 'clear') {
      failsafeActive = false;
      timeline.push({ event: 'Failsafe Cleared', timestamp: new Date().toISOString() });
    }
    res.status(200).json({
      title: 'Failsafe',
      subtitle: '',
      kpis: [
        { label: 'Failsafe State', value: failsafeActive ? 'Active' : 'Inactive' },
      ],
      chips: failsafeActive ? [{ label: 'Active', color: 'error' }] : [{ label: 'Inactive', color: 'success' }],
      rows: [],
      timeline,
      warnings: failsafeActive ? ['Failsafe is currently active!'] : [],
      lastAck: null,
      meta: {},
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
