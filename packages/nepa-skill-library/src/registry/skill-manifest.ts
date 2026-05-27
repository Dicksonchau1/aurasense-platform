// Signed skill metadata manifest
type EmbodimentClass = string;
export interface SkillManifest {
  skillId: string;
  version: number;
  semver: string;
  parentVersion: number | null;
  authorTenantId: string;
  capabilities: string[];
  supportedEmbodiments: EmbodimentClass[];
  constraints: any;
  modelArtifacts: {
    policyUri: string;
    worldModelUri: string | null;
    criticUri: string | null;
    sha256: string;
  };
  retargetingProfile: any;
  trainingProvenance: {
    datasetIds: string[];
    runId: string;
    baseSkillVersion: number | null;
  };
  certifications: any[];
  signature: string;
  chainHead: string;
  publishedAt: number;
}
