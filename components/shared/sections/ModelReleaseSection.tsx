import React from "react";

interface Props {
  vm: any;
  onSelectRelease?: (modelId: string, version: string) => void;
  onCompareReleases?: (idA: string, idB: string) => void;
  onPromoteRelease?: (releaseId: string, channel: string) => void;
  onRollbackRelease?: (releaseId: string, reason: string) => void;
  onAcknowledge?: (operator: string) => void;
}

export const ModelReleaseSection: React.FC<Props> = ({ vm }) => (
  <section>
    <h2 className="text-lg font-bold mb-2">{vm?.title || 'Model Release'}</h2>
    {/* Model release content goes here */}
  </section>
);

export default ModelReleaseSection;
