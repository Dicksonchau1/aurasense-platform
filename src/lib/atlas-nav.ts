export type AtlasNavTarget =
  | '/dashboard'
  | '/dashboard/fleet'
  | '/dashboard/drone-specs'
  | '/dashboard/robot-specs'
  | '/dashboard/audit'
  | '/dashboard/skills'
  | '/dashboard/skill-composer'
  | '/dashboard/mission-planner'
  | '/dashboard/world-model'
  | '/dashboard/compliance'
  | '/dashboard/settings'
  | '/dashboard/billing';

export const atlasNavMap = {
  overview: '/dashboard',
  fleet: '/dashboard/fleet',
  alerts: '/dashboard/audit',
  activity: '/dashboard/audit',
  skills: '/dashboard/skills',
  skillComposer: '/dashboard/skill-composer',
  audit: '/dashboard/audit',
  preflight: '/dashboard/compliance',
  billing: '/dashboard/billing',
  settings: '/dashboard/settings',
  droneSpecs: '/dashboard/drone-specs',
  robotSpecs: '/dashboard/robot-specs',
  worldModel: '/dashboard/world-model',
  missionPlanner: '/dashboard/mission-planner',
  compliance: '/dashboard/compliance',
} as const;

export type AtlasNavKey = keyof typeof atlasNavMap;