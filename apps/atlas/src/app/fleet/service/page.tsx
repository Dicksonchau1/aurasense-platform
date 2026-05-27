// Main dashboard page for Service Bay
import ActiveWorkflowsTable from './components/ActiveWorkflowsTable';
import BayStateTimeline from './components/BayStateTimeline';
import PartsInventoryGrid from './components/PartsInventoryGrid';
import SkuConsumptionChart from './components/SkuConsumptionChart';
import TechnicianScheduleCalendar from './components/TechnicianScheduleCalendar';
import PostServiceValidationPanel from './components/PostServiceValidationPanel';

export default function ServiceDashboard() {
  return (
    <div>
      <h1>Fleet Service Dashboard</h1>
      <ActiveWorkflowsTable />
      <BayStateTimeline />
      <PartsInventoryGrid />
      <SkuConsumptionChart />
      <TechnicianScheduleCalendar />
      <PostServiceValidationPanel />
    </div>
  );
}
