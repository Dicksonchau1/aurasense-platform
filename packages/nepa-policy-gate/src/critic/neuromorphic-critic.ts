// Neuromorphic Critic interface stub
export interface NeuromorphicCritic {
  score(request: any): Promise<{
    risk: number;
    spikeRateHz: number;
    contributingNeurons: number[];
    embeddingHash: string;
  }>;
  veto(request: any): Promise<any>;
}
