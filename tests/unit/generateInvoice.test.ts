import { describe, it, expect, jest, afterEach } from '@jest/globals';
import * as billing from '@/atlas/billing/generateInvoice';

describe('generateMonthlyInvoice', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create an invoice and mark SLO credits as applied with empty data', async () => {
    // All queries return empty/defaults
    jest.spyOn(billing, 'supabase', 'get').mockReturnValue({
      from: () => ({
        select: () => ({ eq: () => ({ single: () => ({ data: undefined }),
          gte: () => ({ lt: () => ({ data: [] }) }) }) }),
        insert: () => ({ select: () => ({ single: () => ({ data: { id: 'inv1', total_hkd: 2200 } }) }) }),
        update: () => ({ eq: () => ({ gte: () => ({ lt: () => ({}) }) }) }),
      }),
    });
    const invoice = await billing.generateMonthlyInvoice('s1', new Date('2024-01-01'));
    expect(invoice).toHaveProperty('id');
    expect(invoice.total_hkd).toBe(2200);
  });

  it('should create an invoice with full data and correct totals', async () => {
    jest.spyOn(billing, 'supabase', 'get').mockReturnValue({
      from: () => ({
        select: () => ({ eq: () => ({ single: () => ({ data: { monthly_hkd: 1000 } }),
          gte: () => ({ lt: () => ({ data: [
            { credit_amount_hkd: 100 },
            { credit_amount_hkd: 50 },
            { amount_hkd: 200 },
            { amount_hkd: 300 },
            { amount_hkd: 400 },
          ] }) }) }) }),
        insert: () => ({ select: () => ({ single: () => ({ data: { id: 'inv2', total_hkd: 1850 } }) }) }),
        update: () => ({ eq: () => ({ gte: () => ({ lt: () => ({}) }) }) }),
      }),
    });
    const invoice = await billing.generateMonthlyInvoice('s2', new Date('2024-02-01'));
    expect(invoice).toHaveProperty('id');
    // 1000 (sub) + 200+300+400 (overages/skills) - (100+50) = 1850
    expect(invoice.total_hkd).toBe(1850);
  });

  it('should throw on insert error', async () => {
    jest.spyOn(billing, 'supabase', 'get').mockReturnValue({
      from: () => ({
        select: () => ({ eq: () => ({ single: () => ({ data: { monthly_hkd: 1000 } }) }) }),
        insert: () => ({ select: () => ({ single: () => ({ error: new Error('insert failed') }) }) }),
        update: () => ({ eq: () => ({ gte: () => ({ lt: () => ({}) }) }) }),
      }),
    });
    await expect(billing.generateMonthlyInvoice('s3', new Date('2024-03-01'))).rejects.toThrow('insert failed');
  });
});