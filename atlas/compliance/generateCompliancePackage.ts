// Minimal stub for generateCompliancePackage for test compatibility
export async function generateCompliancePackage(opts: any) {
  return Buffer.from('stub-pdf');
}
export async function fetchMissions() { return []; }
export async function fetchChecklists() { return []; }
export async function fetchDefects() { return []; }
export async function fetchApprovalReviews() { return []; }
export async function fetchSLOMeasurements() { return []; }
export async function fetchSLOCredits() { return []; }
export async function fetchPrivacyLogs() { return []; }
export async function fetchSiteInfo() { return { name: 'Stub Site' }; }
