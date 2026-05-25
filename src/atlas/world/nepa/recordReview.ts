import { supabase } from '@/lib/supabase';
import { promoteToLive } from './promote';
import type { ReviewPayload } from '../components/ReviewModal';

export async function recordReview(opts:{
  payload: ReviewPayload;
  reviewer: { id: string; email: string };
  decision: 'approved'|'rejected'|'escalated';
  justification: string;
}) {
  const { payload, reviewer, decision, justification } = opts;

  // 1. Insert the review row first (immutable record of the decision moment)
  const { data: review, error } = await supabase.from('approval_reviews').insert({
    mission_promotion_id: null, // filled after promotion if approved
    reviewer_id: reviewer.id,
    reviewer_email: reviewer.email,
    decision,
    justification,
    scores: payload.scores,
    approval: payload.approval,
    rollout_summary: {
      n_steps: payload.rollout.states.length,
      max_uncertainty: Math.max(...payload.rollout.uncertainty),
      max_collision_risk: payload.scores.collisionRisk,
    },
  }).select('id').single();
  if (error) throw error;

  // 2. Only promote if approved
  if (decision === 'approved') {
    const promo = await promoteToLive({
      trajectory: payload.trajectory,
      approval: payload.approval,
      humanApproverId: reviewer.id,
      siteId: payload.siteId,
      sessionId: payload.sessionId,
      missionId: payload.missionId,
    });
    await supabase.from('approval_reviews')
      .update({ mission_promotion_id: promo.promotionId })
      .eq('id', review.id);
    await supabase.from('mission_promotions').update({
      human_decision: 'approved',
      human_decision_at: new Date().toISOString(),
      human_justification: justification,
      human_approver_email: reviewer.email,
    }).eq('id', promo.promotionId);
    return { promotionId: promo.promotionId, reviewId: review.id };
  }

  return { promotionId: null, reviewId: review.id };
}