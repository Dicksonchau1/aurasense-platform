import { NextApiRequest, NextApiResponse } from 'next';

// Mock state for mission commands
let commandsSent = 0;
let timeline: any[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return current state
    res.status(200).json({
      title: 'Mission Commands',
      subtitle: '',
      kpis: [
        { label: 'Commands Sent', value: String(commandsSent) },
      ],
      chips: [],
      rows: [],
      timeline,
      warnings: [],
      lastAck: null,
      meta: {},
    });
  } else if (req.method === 'POST') {
    // Accept a command and update state
    const { command } = req.body;
    commandsSent += 1;
    timeline.push({ event: `Command Sent: ${command}`, timestamp: new Date().toISOString() });
    res.status(200).json({
      title: 'Mission Commands',
      subtitle: '',
      kpis: [
        { label: 'Commands Sent', value: String(commandsSent) },
      ],
      chips: [],
      rows: [],
      timeline,
      warnings: [],
      lastAck: null,
      meta: {},
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
