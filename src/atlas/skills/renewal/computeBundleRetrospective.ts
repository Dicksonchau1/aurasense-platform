import { supabase } from '@/lib/supabase';

export async function computeBundleRetrospective(masterContractId: string) {
  const { data: children } = await supabase.from('skill_contracts')
    .select('id, skill_id, sla_tier').eq('parent_contract_id', masterContractId);

  const retros = await Promise.all((children ?? []).map(async c => {
    const { data } = await supabase.rpc('compute_contract_retrospective', { p_contract_id: c.id });
    return { ...c, retro: data };
  }));

  const strongCount   = retros.filter(r => r.retro.uptier_signal === 'strong').length;
  const moderateCount = retros.filter(r => r.retro.uptier_signal === 'moderate').length;

  return {
    masterContractId,
    perSkill: retros,
    portfolioSignal: strongCount >= 2 ? 'strong'
                   : (strongCount + moderateCount) >= retros.length / 2 ? 'moderate'
                   : 'none',
    suggestedAction: strongCount >= 2
      ? `Uptier ${strongCount} skills + extend bundle by 12 months`
      : 'Renew bundle as-is',
  };
}