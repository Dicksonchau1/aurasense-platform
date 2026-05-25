import type {
  GeometricAnchor,
  StructuralAnchor,
  OperationalRegime,
  SignaturePayload
} from '@/src/lib/signature-map/types';
import type {
  RehearseSessionContext,
  SubstrateAction
} from './types';

export interface FrameExcerpt {
  frame_id: string;
  substrate_run_id: string;
  modulator_score: number;
  telemetry_snapshot: Record<string, unknown>;
  substrate_action: SubstrateAction;
  ts: number;
}

export interface SignatureContribution {
  frame_excerpt: FrameExcerpt;
  geometric_anchor: GeometricAnchor;
  structural_anchor: StructuralAnchor;
  operational_regime: OperationalRegime;
  extracted_signature: SignaturePayload;
  deployment_id: string;
  run_id: string;
  substrate_run_id: string;
}

function mapActionTypeToSignatureType(type: string): string {
  if (type.startsWith('correct:')) return 'scene_correction';
  if (type.startsWith('project:')) return 'projection_signature';
  if (type.startsWith('flag:')) return 'anomaly_signature';
  if (type.startsWith('frame:')) return 'captured_frame_signature';
  return 'unknown_signature';
}

export function normaliseFrame(
  frame: FrameExcerpt,
  session: RehearseSessionContext
): SignatureContribution {
  const { substrate_action } = frame;
  const signature_type = mapActionTypeToSignatureType(substrate_action.type);
  const extracted_signature: SignaturePayload = {
    signature_type,
    payload: substrate_action.payload,
    uncertainty: 1.0,
    sample_count: 1,
    ...(substrate_action.payload && typeof substrate_action.payload === 'object'
      ? {
          uncertainty: (substrate_action.payload.uncertainty as number) ?? 1.0,
          sample_count: (substrate_action.payload.sample_count as number) ?? 1
        }
      : {})
  };
  return {
    frame_excerpt: frame,
    geometric_anchor: session.geo as GeometricAnchor,
    structural_anchor: session.asset as StructuralAnchor,
    operational_regime: session.conditions,
    extracted_signature,
    deployment_id: session.deployment_id,
    run_id: session.run_id,
    substrate_run_id: session.substrate_run_id
  };
}

export function isHighModulatorFrame(frame: FrameExcerpt, threshold = 0.7): boolean {
  return frame.modulator_score >= threshold;
}
