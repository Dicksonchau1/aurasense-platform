// Main integration for Power Orchestrator SDK: Live NEPA data → swap scheduling + audit
import { BatteryTelemetryConsumer } from './battery-telemetry-consumer';
import { SwapScheduler } from './swap-scheduler';
import { Battery } from './types';

const NEPA_WS_URL = process.env.NEPA_WS_URL || 'wss://nepa.example.com';
const ROBOT_ID = process.env.ROBOT_ID || 'robot-123';

const consumer = new BatteryTelemetryConsumer(NEPA_WS_URL);
const scheduler = new SwapScheduler();

// Example: available bays (would be fetched from DB/service in production)
const availableBays = [
  { id: 'bay-1', occupied: false },
  { id: 'bay-2', occupied: false },
];

consumer.connect(ROBOT_ID, async (battery: Battery) => {
  // 1. Schedule swap if needed
  await scheduler.scheduleSwap(ROBOT_ID, battery);
  // 2. Try to reserve a bay if swap is needed
  if (battery.soc < 15) {
    const result = scheduler.reserveBay(ROBOT_ID, availableBays);
    if (result.success) {
      console.log(`Bay reserved: ${result.bayId}`);
      // ...proceed with swap logic, emit more audit events as needed
    } else {
      console.log('No available bay for swap');
    }
  }
});

// Optional: handle graceful shutdown
process.on('SIGINT', () => {
  consumer.disconnect();
  process.exit();
});
