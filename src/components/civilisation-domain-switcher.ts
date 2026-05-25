// STUB - civilisation domain enumeration. Wire to real domain registry.
// Created during recovery on 2026-05-26.

export type DomainKey = 'infrastructure' | 'healthcare' | 'defense' | 'logistics' | 'energy';

export interface Domain {
  key: DomainKey;
  label: string;
  description: string;
}

export const DOMAINS: Domain[] = [
  { key: 'infrastructure', label: 'Infrastructure', description: 'Built environment inspection and maintenance' },
  { key: 'healthcare',     label: 'Healthcare',     description: 'Clinical procedure rehearsal and execution' },
  { key: 'defense',        label: 'Defense',        description: 'Perimeter security and threat response' },
  { key: 'logistics',      label: 'Logistics',      description: 'Autonomous transport and delivery' },
  { key: 'energy',         label: 'Energy',         description: 'Grid and pipeline monitoring' },
];

export default DOMAINS;