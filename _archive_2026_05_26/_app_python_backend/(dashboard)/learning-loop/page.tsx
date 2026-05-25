// Learning Loop Page
import LearningDashboard from '../../../components/LearningDashboard';
import STDPPanel from '../../../components/STDPPanel';

export default function LearningLoopPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Learning Loop / Model Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <STDPPanel />
        <LearningDashboard />
      </div>
    </div>
  );
}
