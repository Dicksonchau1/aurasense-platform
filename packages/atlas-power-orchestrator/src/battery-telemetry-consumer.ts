// Consumes NEPA battery prognostics via WebSocket
import { Battery } from './types';

// Usage: new BatteryTelemetryConsumer('wss://nepa.example.com').connect('robot-123', (data) => ...)
export class BatteryTelemetryConsumer {
  private ws?: WebSocket;
  constructor(private wsUrl: string) {}

  connect(robotId: string, onData: (data: Battery) => void) {
    // Connect to real NEPA endpoint (wss://...)
    const url = `${this.wsUrl}/robots/${robotId}/battery_prognostics`;
    this.ws = new WebSocket(url);
    this.ws.onopen = () => {
      console.log('Connected to NEPA battery prognostics:', url);
    };
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onData(data as Battery);
      } catch (e) {
        console.error('Invalid battery telemetry:', e);
      }
    };
    this.ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
    this.ws.onclose = () => {
      console.log('Disconnected from NEPA battery prognostics');
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
  }
}
