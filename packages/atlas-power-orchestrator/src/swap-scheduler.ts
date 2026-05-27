// Schedules swaps and manages bay reservations
import { Battery, ChargingBay, ReservationResult } from './types';
import { emitAuditLog } from '../../apps/atlas/src/lib/nepa/audit';

// Simulated advisory lock for atomic reservation (replace with real DB lock in production)
const bayLocks: Record<string, boolean> = {};

export class SwapScheduler {
  reserveBay(robotId: string, availableBays: ChargingBay[]): ReservationResult {
    for (const bay of availableBays) {
      if (!bay.occupied && !bayLocks[bay.id]) {
        // Simulate advisory lock
        bayLocks[bay.id] = true;
        bay.occupied = true;
        bay.reservedBy = robotId;
        emitAuditLog({
          action: 'ORCHESTRATOR_TICK',
          actor: robotId,
          details: { event: 'bay_reserved', bayId: bay.id },
        });
        return { success: true, bayId: bay.id };
      }
    }
    emitAuditLog({
      action: 'ORCHESTRATOR_TICK',
      actor: robotId,
      details: { event: 'bay_reservation_failed' },
    });
    return { success: false, reason: 'No available bay' };
  }

  releaseBay(bayId: string) {
    bayLocks[bayId] = false;
  }

  async scheduleSwap(robotId: string, battery: Battery) {
    // Example: schedule swap if SOC < 15%
    if (battery.soc < 15) {
      await emitAuditLog({
        action: 'ORCHESTRATOR_TICK',
        actor: robotId,
        details: { event: 'swap_scheduled', soc: battery.soc },
      });
      console.log(`Scheduling swap for robot ${robotId} (SOC: ${battery.soc}%)`);
    }
  }
}
