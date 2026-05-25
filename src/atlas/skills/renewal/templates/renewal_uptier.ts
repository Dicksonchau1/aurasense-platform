export function renewalUptierEmail(retro: any, contract: any) {
  return {
    subject: `Your ${contract.skill_id} compliance is ${(retro.avg_compliance*100).toFixed(1)}% — time to formalize the upgrade`,
    body: `
Over the past 12 months, your ${contract.skill_id} skill exceeded its contracted SLA floor on ${(retro.avg_compliance*100).toFixed(1)}% of ${retro.measurement_count} missions, with an average margin of +${(retro.avg_margin*100).toFixed(1)}%.

That's well above your current ${retro.current_tier}-tier commitment. You're effectively running at ${retro.suggested_tier}-tier performance without the contractual recognition.

Upgrading to ${retro.suggested_tier} formalizes what your data already shows:
  • Higher contracted floor matches your real performance
  • ${retro.suggested_tier === 'critical' ? '3×' : '1.5×'} credit multiplier on any future breach
  • ${retro.suggested_tier === 'critical' ? '7-day' : '14-day'} measurement window for faster response
  • Audit package qualifies for higher procurement tier (HKCAD AC-011, ArchSD QC-7)

Review your retrospective and decide:
  → ${process.env.NEXT_PUBLIC_APP_URL}/renewals/${contract.id}

Your contract renews automatically in 30 days at the current tier unless you choose otherwise.
    `.trim(),
  };
}