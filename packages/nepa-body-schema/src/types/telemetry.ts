import { AutonomyLevel, MissionId, RobotId, SkillId } from './schema';

export interface IMUSample {
  accelX: number; accelY: number; accelZ: number;
  gyroX: number;  gyroY: number;  gyroZ: number;
}

export interface ContactSample {
  bodyPart: string;
  normalForceN: number;
  shearForceN: number;
  isGrasp: boolean;
}

export interface TaskContext {
  skillId: SkillId;
  skillPhase: 'approach' | 'grasp' | 'transport' | 'release' | 'recover' | 'idle';
  autonomy: AutonomyLevel;
  payloadKg: number;
  missionId: MissionId;
}

export interface TelemetryFrame {
  robotId: RobotId;
  timestamp: number;             // ms epoch (monotonic)
  sequenceId: number;
  jointPositionRad: Float32Array;
  jointVelocityRadS: Float32Array;
  jointCurrentA: Float32Array;
  jointTempC: Float32Array;
  jointTorqueNm: Float32Array;
  imu: IMUSample;
  contacts: ContactSample[];
  audioWindow?: Uint8Array;
  taskContext: TaskContext;
}
