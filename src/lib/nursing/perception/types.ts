// Shared perception types for nurse rehearse real-time pipeline.

export interface Landmark2D { x: number; y: number; visibility?: number }
export interface Landmark3D { x: number; y: number; z: number; visibility?: number }

export interface PoseLandmarks {
  ts_ms: number;
  // MediaPipe BlazePose 33-point topology
  points: Landmark3D[];
  // Confidence 0-1
  confidence: number;
}

export interface FaceLandmarks {
  ts_ms: number;
  // MediaPipe FaceMesh 468-point topology
  points: Landmark2D[];
  // Derived gaze vector in screen space
  gaze: { x: number; y: number };
  confidence: number;
}

export interface PerceptionFrame {
  ts_ms: number;
  session_id: string;
  pose?: PoseLandmarks;
  face?: FaceLandmarks;
  // Original frame as data URL for audit/clip extraction
  thumbnail_data_url?: string;
}

export interface Metrics {
  posture: number;       // 0-100
  framing: number;       // 0-100
  gaze: number;          // 0-100
  envelope: number;      // 0-100 (voice envelope, future)
  consistency: number;   // 0-1
}

export interface CoachingPrompt {
  id: string;
  ts_ms: number;
  severity: "info" | "warn" | "urgent";
  text: string;
  metric: keyof Metrics;
  expires_ms: number;
}

export interface SkillEvaluation {
  skill_id: string;
  skill_name: string;
  score: number;         // 0-100
  evidence_clips: Array<{ ts_start_ms: number; ts_end_ms: number; note: string }>;
}

export interface OrchestratorTickResult {
  metrics: Metrics;
  prompt: CoachingPrompt | null;
  evaluations: SkillEvaluation[];
  audit_event_id: string;
}