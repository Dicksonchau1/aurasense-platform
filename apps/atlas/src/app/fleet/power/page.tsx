// Main dashboard page for Power Hot-Swap
import FleetSocGrid from './components/FleetSocGrid';
import BayOccupancyTimeline from './components/BayOccupancyTimeline';
import BatteryInventoryHeatmap from './components/BatteryInventoryHeatmap';
import SwapEventStream from './components/SwapEventStream';
import PredictedSwapWindowChart from './components/PredictedSwapWindowChart';

export default function PowerDashboard() {
  return (
    <div>
      <h1>Fleet Power Dashboard</h1>
      <FleetSocGrid />
      <BayOccupancyTimeline />
      <BatteryInventoryHeatmap />
      <SwapEventStream />
      <PredictedSwapWindowChart />
    </div>
  );
}
