import React from "react";
// Simple error boundary for section
class SectionErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, info: any) { /* log error if needed */ }
  render() {
    if (this.state.hasError) return <section className="atlas-panel p-4 text-rose-400">Section failed to load.</section>;
    return this.props.children;
  }
}
import { KpiCard, StatusChip, TimelineList } from "@/components/atlas/primitives";
import { HybridLearningProvenance } from "@/lib/hybridLearningProvenance";
import type { PolicyReceiptPanelVM } from "@/lib/atlas/view-models-ardupilot";

interface Props {
  vm: PolicyReceiptPanelVM;
  onAcknowledge?: (operator: string) => void;
  onDownloadPolicy?: () => void;
}


const PolicyReceiptSection: React.FC<Props> = ({ vm, onAcknowledge, onDownloadPolicy }) => {
  if (!vm || typeof vm !== 'object') {
    return <section className="atlas-panel p-4 text-rose-400">Policy data missing.</section>;
  }
  return (
    <SectionErrorBoundary>
      <section>
        <h2 className="text-lg font-bold mb-2">{vm.title || 'Policy Receipt'}</h2>
        {vm.subtitle && <div className="text-sm text-slate-400 mb-2">{vm.subtitle}</div>}
        <div className="flex flex-row gap-4 mb-2">
          {Array.isArray(vm.kpis) && vm.kpis.length > 0 ? vm.kpis.map((kpi, i) => (
            <KpiCard key={i} label={kpi.label} value={kpi.value} />
          )) : <span className="text-slate-400">No KPIs</span>}
        </div>
        <div className="flex flex-row gap-2 mb-2">
          {Array.isArray(vm.chips) && vm.chips.length > 0 ? vm.chips.map((chip, i) => (
            <StatusChip key={i} label={chip.label} color={chip.color} />
          )) : <span className="text-slate-400">No status</span>}
          {/* Hybrid learning provenance for trust/recommendation */}
          {vm.meta && vm.meta.sessionId && vm.meta.recommendationId
            ? <HybridLearningProvenance sessionId={String(vm.meta.sessionId)} recommendationId={String(vm.meta.recommendationId)} />
            : null}
        </div>
        <div className="my-2">
          {onAcknowledge && (
            <button className="btn btn-primary mr-2" onClick={() => onAcknowledge("Operator")}>Acknowledge Policy</button>
          )}
          {vm.meta && typeof vm.meta.policyDocUrl === 'string' && vm.meta.policyDocUrl && (
            <a href={vm.meta.policyDocUrl} target="_blank" rel="noopener noreferrer">
              <button className="btn btn-secondary" onClick={onDownloadPolicy}>Download Policy</button>
            </a>
          )}
        </div>
        <div className="mt-4">
          <TimelineList rows={Array.isArray(vm.timeline) && vm.timeline.length > 0 ? vm.timeline.map(row => ({
            label: (row.event || row.title || ""),
            value: `${row.actor || row.user || ""} @ ${row.timestamp || ""}`
          })) : []} />
        </div>
      </section>
    </SectionErrorBoundary>
  );
};

export default PolicyReceiptSection;
