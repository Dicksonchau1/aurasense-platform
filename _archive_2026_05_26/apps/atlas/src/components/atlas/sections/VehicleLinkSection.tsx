import React, { useState } from "react";
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
import { useState } from "react";
import { useAgents } from "@/hooks/use-agents";

const VehicleLinkSection: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const { data: agents, isLoading, isError } = useAgents();

  return (
    <SectionErrorBoundary>
      <section>
        <h2 className="text-lg font-bold mb-2">Vehicle Link</h2>
        <div className="mb-2">
          <span className="font-semibold">Linked Vehicle:</span> {selected ? selected : "None"}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Available Agents:</span>
          {isLoading && <span className="text-slate-400 ml-2">Loading...</span>}
          {isError && <span className="text-rose-400 ml-2">Error loading agents</span>}
          {Array.isArray(agents) && agents.length > 0 ? (
            <ul className="list-disc ml-6">
              {agents.map((agent: any) => (
                <li key={agent.id} className="mb-1">
                  <button
                    className={`px-2 py-1 rounded ${selected === agent.id ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    onClick={() => setSelected(agent.id)}
                  >
                    {agent.name} ({agent.type})
                  </button>
                </li>
              ))}
            </ul>
          ) : !isLoading && <span className="text-slate-400 ml-2">No agents available</span>}
