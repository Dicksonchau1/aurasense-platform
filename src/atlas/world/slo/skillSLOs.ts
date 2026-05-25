// Utility functions for SKILL_SLOS

export function getSLOsForSkill(skill: string) {
  return SKILL_SLOS[skill] || [];
}

export function getAllSkills(): string[] {
  return Object.keys(SKILL_SLOS);
}

export function getAllSLOs(): Array<{ skill: string; slo: typeof SKILL_SLOS[string][number] }> {
  return Object.entries(SKILL_SLOS).flatMap(([skill, slos]) =>
    slos.map(slo => ({ skill, slo }))
  );
}

export function filterSLOsByMetric(metric: 'coverage' | 'defect_likelihood' | 'composite') {
  return getAllSLOs().filter(({ slo }) => slo.metric === metric);
}

export function validateCreditPctSums(): Array<{ skill: string; totalCredit: number }> {
  return getAllSkills().map(skill => {
    const totalCredit = SKILL_SLOS[skill].reduce((sum, slo) => sum + slo.creditPct, 0);
    return { skill, totalCredit };
  });
}
export const SKILL_SLOS: Record<string, Array<{
  sloName: string;
  metric: 'coverage' | 'defect_likelihood' | 'composite';
  sloTarget: number;
  slaFloor: number;
  measurementWindowDays: number;
  creditPct: number;
}>> = {
  'facade-crack-inspection': [
    { sloName: 'defect-detection-coverage', metric: 'coverage', sloTarget: 0.95, slaFloor: 0.85, measurementWindowDays: 30, creditPct: 15 },
    { sloName: 'false-positive-discipline', metric: 'defect_likelihood', sloTarget: 0.90, slaFloor: 0.75, measurementWindowDays: 30, creditPct: 10 },
  ],
  'roof-edge-spalling-survey': [
    { sloName: 'edge-coverage', metric: 'coverage', sloTarget: 0.96, slaFloor: 0.88, measurementWindowDays: 30, creditPct: 15 },
    { sloName: 'defect-confidence-quality', metric: 'defect_likelihood', sloTarget: 0.92, slaFloor: 0.78, measurementWindowDays: 30, creditPct: 10 },
  ],
  'thermal-facade-anomaly-scan': [
    { sloName: 'anomaly-localisation-score', metric: 'composite', sloTarget: 0.91, slaFloor: 0.80, measurementWindowDays: 30, creditPct: 12 },
    { sloName: 'coverage-under-wind-variance', metric: 'coverage', sloTarget: 0.93, slaFloor: 0.82, measurementWindowDays: 30, creditPct: 8 },
  ],
  'confined-corridor-navigation': [
    { sloName: 'route-completion-reliability', metric: 'composite', sloTarget: 0.97, slaFloor: 0.90, measurementWindowDays: 14, creditPct: 12 },
    { sloName: 'collision-avoidance-discipline', metric: 'composite', sloTarget: 0.98, slaFloor: 0.92, measurementWindowDays: 14, creditPct: 12 },
  ],
  'substation-perimeter-patrol': [
    { sloName: 'patrol-coverage', metric: 'coverage', sloTarget: 0.97, slaFloor: 0.90, measurementWindowDays: 30, creditPct: 10 },
    { sloName: 'intrusion-defect-confidence', metric: 'defect_likelihood', sloTarget: 0.89, slaFloor: 0.74, measurementWindowDays: 30, creditPct: 8 },
  ],
  'flare-stack-visual-inspection': [
    { sloName: 'high-vertical-asset-coverage', metric: 'coverage', sloTarget: 0.94, slaFloor: 0.84, measurementWindowDays: 30, creditPct: 12 },
    { sloName: 'severity-ranking-fidelity', metric: 'composite', sloTarget: 0.90, slaFloor: 0.76, measurementWindowDays: 30, creditPct: 8 },
  ],
  'wetlab-pipetting-verification': [
    { sloName: 'procedural-step-fidelity', metric: 'composite', sloTarget: 0.98, slaFloor: 0.93, measurementWindowDays: 14, creditPct: 15 },
    { sloName: 'anomaly-detection-confidence', metric: 'defect_likelihood', sloTarget: 0.94, slaFloor: 0.85, measurementWindowDays: 14, creditPct: 10 },
  ],
  'tendon-actuation-latency-check': [
    { sloName: 'actuation-response-consistency', metric: 'composite', sloTarget: 0.97, slaFloor: 0.91, measurementWindowDays: 14, creditPct: 10 },
    { sloName: 'telemetry-coverage', metric: 'coverage', sloTarget: 0.99, slaFloor: 0.95, measurementWindowDays: 14, creditPct: 8 },
  ],
};