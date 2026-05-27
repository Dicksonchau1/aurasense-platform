export type RobotId = string & { readonly __brand: 'RobotId' };
export type ProfileId = string & { readonly __brand: 'ProfileId' };
export type MissionId = string & { readonly __brand: 'MissionId' };
export type SkillId = string & { readonly __brand: 'SkillId' };

export enum AutonomyLevel {
  L0_MANUAL = 'L0_MANUAL',
  L1_SUGGEST = 'L1_SUGGEST',
  L2_SUPERVISED = 'L2_SUPERVISED',
  L3_GUARDED = 'L3_GUARDED',
  L4_SITE_CERT = 'L4_SITE_CERT',
  L5_FLEET_CERT = 'L5_FLEET_CERT',
}

export enum WearMode {
  FRICTION = 'FRICTION',
  BACKLASH = 'BACKLASH',
  THERMAL = 'THERMAL',
  BEARING = 'BEARING',
  ENCODER_DRIFT = 'ENCODER_DRIFT',
  GEAR = 'GEAR',
}

export enum RecommendedAction {
  NONE = 'NONE',
  REDUCE_PAYLOAD = 'REDUCE_PAYLOAD',
  REROUTE_LIGHT_TASK = 'REROUTE_LIGHT_TASK',
  RETURN_TO_CHARGE = 'RETURN_TO_CHARGE',
  REQUEST_SERVICE = 'REQUEST_SERVICE',
  EMERGENCY_STOP = 'EMERGENCY_STOP',
}

export enum AnomalySeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  EMERGENCY = 'EMERGENCY',
}

export interface JointSpec {
  jointId: number;
  name: string;
  type: 'REVOLUTE' | 'PRISMATIC' | 'SPHERICAL';
  minPositionRad: number;
  maxPositionRad: number;
  maxVelocityRadS: number;
  maxTorqueNm: number;
  thermalLimitC: number;
  actuatorModel: string;
}

export interface EmbodimentProfile {
  profileId: ProfileId;
  vendor: string;
  model: string;
  dofCount: number;
  joints: JointSpec[];
  power: {
    batteryCapacityWh: number;
    nominalVoltageV: number;
    swapDurationS: number;
    typicalRuntimeS: number;
  };
  thermal: { ambientMaxC: number; ambientMinC: number };
  firmwareVersion: string;
}

export interface JointHealth {
  jointId: number;
  healthScore: number;       // 0..1
  estimatedRulHours: number;
  wearVelocity: number;
  activeModes: WearMode[];
}

export interface PlasticityState {
  currentDopamineLevel: number;
  stdpUpdatesCount: number;
  weightNorm: number;
  calibrationComplete: boolean;
}

export interface BodySchemaState {
  robotId: RobotId;
  timestamp: number;             // ms epoch
  embedding: Float32Array;       // length 256
  confidence: number;            // 0..1
  noveltyScore: number;          // z-score
  schemaVersion: number;
  perJoint: JointHealth[];
  thermalMarginC: number[];
  recommendedAction: RecommendedAction;
  recommendationReason: string;
  operationalHours: number;
  plasticity: PlasticityState;
}

export interface SerializedSchema {
  robotId: RobotId;
  profileId: ProfileId;
  schemaVersion: number;
  spikingWeights: Uint8Array;
  plasticityState: Uint8Array;
  wearHeadWeights: Uint8Array;
  operationalHours: number;
  checksum: string;
}
