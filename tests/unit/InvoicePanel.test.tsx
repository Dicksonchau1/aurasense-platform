import { render, screen } from '@testing-library/react';
import { InvoicePanel } from '@/atlas/billing/InvoicePanel';

describe('InvoicePanel', () => {
  it('renders invoices and PDF link', () => {
    const invoices = [
      {
        id: 'inv1',
        period_start: '2024-01-01',
        period_end: '2024-03-31',
        subscription_hkd: 1000,
        postflight_overage_hkd: 0,
        skills_hkd: 0,
        slo_credits_hkd: 0,
        total_hkd: 1000,
        status: 'draft',
        pdf_url: 'http://example.com/invoice.pdf',
      },
    ];
    jest.spyOn(require('@/lib/supabase'), 'supabase', 'get').mockReturnValue({
      from: () => ({ select: () => ({ eq: () => ({ order: () => ({ limit: () => Promise.resolve({ data: invoices }) }) }) }) }),
    });
    render(<InvoicePanel siteId="s1" />);
    expect(screen.getByText('Invoices')).toBeInTheDocument();
    expect(screen.getByText('2024-01-01 – 2024-03-31')).toBeInTheDocument();
    expect(screen.getByText('Download PDF')).toBeInTheDocument();
  });
});