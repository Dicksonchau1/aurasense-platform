import { NextRequest, NextResponse } from 'next/server';
import { generateCompliancePackage } from '@/atlas/compliance/generateCompliancePackage';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { siteId, periodStart, periodEnd, requestedBy } = await req.json();
  const pdf = await generateCompliancePackage({
    siteId,
    periodStart: new Date(periodStart),
    periodEnd: new Date(periodEnd),
    requestedBy,
  });

  // Store the package permanently (immutable audit artifact)
  const filename = `compliance/${siteId}/${periodStart.slice(0,7)}.pdf`;
  await supabase.storage.from('atlas-compliance').upload(filename, pdf, {
    contentType: 'application/pdf', upsert: false,
  });
  const { data: url } = supabase.storage.from('atlas-compliance').getPublicUrl(filename);

  await supabase.from('compliance_packages').insert({
    site_id: siteId, period_start: periodStart, period_end: periodEnd,
    generated_by: requestedBy.id, pdf_url: url.publicUrl,
  });

  return new NextResponse(pdf, {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="ATLAS_Compliance_${siteId}_${periodStart.slice(0,7)}.pdf"`,
    },
  });
}