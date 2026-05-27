// MissionManager: Integrates MissionFSM with mission lifecycle
import { MissionFSM, MissionFSMState, MissionFSMEvent } from './mission_fsm';

export interface Mission {
  missionId: string;
  state: MissionFSMState;
  fsm: MissionFSM;
  // ...other mission fields
}

export class MissionManager {
  private missions: Map<string, Mission> = new Map();

  createMission(missionId: string): Mission {
    const fsm = new MissionFSM();
    const mission: Mission = { missionId, state: fsm.getState(), fsm };
    this.missions.set(missionId, mission);
    return mission;
  }

  getMission(missionId: string): Mission | undefined {
    return this.missions.get(missionId);
  }

  triggerEvent(missionId: string, event: MissionFSMEvent): MissionFSMState | undefined {
    const mission = this.missions.get(missionId);
    if (!mission) return undefined;
    mission.fsm.transition(event);
    mission.state = mission.fsm.getState();
    return mission.state;
  }

  getAuditLog(missionId: string) {
    const mission = this.missions.get(missionId);
    return mission?.fsm.getAuditLog() || [];
  }
}
