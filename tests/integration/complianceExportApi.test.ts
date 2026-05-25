import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import pdfParse from 'pdf-parse';
import app from '@/app'; // Adjust import to your Next.js/Express app entry point

describe('POST /api/compliance/export', () => {
  it('should return a PDF file with empty data', async () => {
    const res = await request(app)
      .post('/api/compliance/export')
      .send({
        siteId: 's1',
        periodStart: '2024-01-01',
        periodEnd: '2024-03-31',
        requestedBy: { id: 'u1', name: 'Test User', role: 'admin' },
      });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.headers['content-disposition']).toContain('attachment');
    expect(res.body.length).toBeGreaterThan(0);
    // Parse PDF and check for cover text
    const pdf = await pdfParse(res.body);
    expect(pdf.text).toContain('ATLAS Inspection Compliance Report');
    expect(pdf.text).toContain('Test User');
  });

  it('should return a PDF file with full data', async () => {
    // Optionally, set up DB or mocks for full data scenario
    const res = await request(app)
      .post('/api/compliance/export')
      .send({
        siteId: 's2',
        periodStart: '2024-04-01',
        periodEnd: '2024-06-30',
        requestedBy: { id: 'u2', name: 'Full User', role: 'manager' },
      });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.headers['content-disposition']).toContain('attachment');
    expect(res.body.length).toBeGreaterThan(0);
    // Parse PDF and check for all section headers
    const pdf = await pdfParse(res.body);
    expect(pdf.text).toContain('ATLAS Inspection Compliance Report');
    expect(pdf.text).toContain('Section 2 — Flight Log');
    expect(pdf.text).toContain('Section 3 — Pre/Post-Flight Checklists');
    expect(pdf.text).toContain('Section 4 — AI Defect Analytics');
    expect(pdf.text).toContain('Section 5 — Trajectory Approval Audit');
    expect(pdf.text).toContain('Section 6 — SLO Compliance');
    expect(pdf.text).toContain('Section 7 — Privacy Compliance Declaration');
  });
});