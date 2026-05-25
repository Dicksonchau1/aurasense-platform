import { describe, it, expect, jest, afterEach } from '@jest/globals';
import * as compliance from '@/atlas/compliance/generateCompliancePackage';
import pdfParse from 'pdf-parse';

describe('generateCompliancePackage', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return a Buffer and call all fetchers with empty data', async () => {
    // All fetchers return empty
    jest.spyOn(compliance, 'fetchMissions').mockResolvedValue([]);
    jest.spyOn(compliance, 'fetchChecklists').mockResolvedValue([]);
    jest.spyOn(compliance, 'fetchDefects').mockResolvedValue([]);
    jest.spyOn(compliance, 'fetchApprovalReviews').mockResolvedValue([]);
    jest.spyOn(compliance, 'fetchSLOMeasurements').mockResolvedValue([]);
    jest.spyOn(compliance, 'fetchSLOCredits').mockResolvedValue([]);
    jest.spyOn(compliance, 'fetchPrivacyLogs').mockResolvedValue([]);
    jest.spyOn(compliance, 'fetchSiteInfo').mockResolvedValue({ name: 'Test Site' });

    const opts = {
      siteId: 's1',
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-03-31'),
      requestedBy: { id: 'u1', name: 'Test User', role: 'admin' },
    };
    const buf = await compliance.generateCompliancePackage(opts);
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(0);
    // Parse PDF and check for cover text
    const pdf = await pdfParse(buf);
    expect(pdf.text).toContain('ATLAS Inspection Compliance Report');
    expect(pdf.text).toContain('Test Site');
  });

  it('should handle full data and render all sections', async () => {
    jest.spyOn(compliance, 'fetchMissions').mockResolvedValue([
      { id: 'm1', promoted_at: '2024-01-02T00:00:00Z', site_id: 's1', drone_registration: 'DRONE1', approver_id: 'pilot1', duration_min: 15, status: 'complete' }
    ]);
    jest.spyOn(compliance, 'fetchChecklists').mockResolvedValue([
      { checklist_type: 'pre', drone_registration: 'DRONE1', remote_pilot_id: 'pilot1', signed_by: 'pilot1', signed_at: '2024-01-02T00:00:00Z', items: [{ item: 'Battery', passed: true }] }
    ]);
    jest.spyOn(compliance, 'fetchDefects').mockResolvedValue([
      { asset_id: 'A1', defect_type: 'crack', severity: 'high', confidence: 0.95, review_status: 'confirmed', reviewed_by: 'inspector', annotated_at: '2024-01-02T00:00:00Z' }
    ]);
    jest.spyOn(compliance, 'fetchApprovalReviews').mockResolvedValue([
      { mission_promotion_id: 'm1', decision: 'approved', approval: { tier: 1, policyVersion: 'v1', reasons: ['safe'] }, reviewer_email: 'reviewer@x.com', decided_at: '2024-01-02T00:00:00Z', justification: 'All good' }
    ]);
    jest.spyOn(compliance, 'fetchSLOMeasurements').mockResolvedValue([
      { skill_id: 'ai_detect', sla_met: true, slo_met: true }
    ]);
    jest.spyOn(compliance, 'fetchSLOCredits').mockResolvedValue([
      { skill_id: 'ai_detect', credit_amount_hkd: 100 }]
    );
    jest.spyOn(compliance, 'fetchPrivacyLogs').mockResolvedValue([
      { identifiable_frames_detected: 5, identifiable_frames_retained: 0, blur_applied: true }
    ]);
    jest.spyOn(compliance, 'fetchSiteInfo').mockResolvedValue({ name: 'Full Data Site' });

    const opts = {
      siteId: 's1',
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-03-31'),
      requestedBy: { id: 'u1', name: 'Test User', role: 'admin' },
    };
    const buf = await compliance.generateCompliancePackage(opts);
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(0);
    // Parse PDF and check for key section text
    const pdf = await pdfParse(buf);
    expect(pdf.text).toContain('Full Data Site');
    expect(pdf.text).toContain('Section 2 — Flight Log');
    expect(pdf.text).toContain('Section 3 — Pre/Post-Flight Checklists');
    expect(pdf.text).toContain('Section 4 — AI Defect Analytics');
    expect(pdf.text).toContain('Section 5 — Trajectory Approval Audit');
    expect(pdf.text).toContain('Section 6 — SLO Compliance');
    expect(pdf.text).toContain('Section 7 — Privacy Compliance Declaration');
    expect(pdf.text).toContain('crack');
    expect(pdf.text).toContain('Battery:✔');
    expect(pdf.text).toContain('approved');
    expect(pdf.text).toContain('Credits issued');
    expect(pdf.text).toContain('identifiable frames detected');
  });

  it('should handle fetcher errors gracefully', async () => {
    jest.spyOn(compliance, 'fetchMissions').mockRejectedValue(new Error('DB error'));
    jest.spyOn(compliance, 'fetchChecklists').mockResolvedValue([]);
    jest.spyOn(compliance, 'fetchDefects').mockResolvedValue([]);
    jest.spyOn(compliance, 'fetchApprovalReviews').mockResolvedValue([]);
    jest.spyOn(compliance, 'fetchSLOMeasurements').mockResolvedValue([]);
    jest.spyOn(compliance, 'fetchSLOCredits').mockResolvedValue([]);
    jest.spyOn(compliance, 'fetchPrivacyLogs').mockResolvedValue([]);
    jest.spyOn(compliance, 'fetchSiteInfo').mockResolvedValue({ name: 'Test Site' });

    const opts = {
      siteId: 's1',
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-03-31'),
      requestedBy: { id: 'u1', name: 'Test User', role: 'admin' },
    };
    await expect(compliance.generateCompliancePackage(opts)).rejects.toThrow('DB error');
  });
});