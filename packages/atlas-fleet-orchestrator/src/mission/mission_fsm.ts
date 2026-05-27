// Five-State FSM for Mission Conductor
// Based on Artifact A 1.5

export type MissionFSMState =
  | 'IDLE'
  | 'NAVIGATING'
  | 'EXEC_SKILL'
  | 'ERROR_RECOVERY'
  | 'SAFE_STOP';

export type MissionFSMEvent =
  | 'assign'
  | 'arrived'
  | 'fault'
  | 'reset'
  | 'fatal';

export class MissionFSM {
  private state: MissionFSMState = 'IDLE';
  private auditLog: { from: MissionFSMState; to: MissionFSMState; event: MissionFSMEvent; timestamp: number }[] = [];

  transition(event: MissionFSMEvent): void {
    const from = this.state;
    let to = from;
    switch (from) {
      case 'IDLE':
        if (event === 'assign') to = 'NAVIGATING';
        break;
      case 'NAVIGATING':
        if (event === 'arrived') to = 'EXEC_SKILL';
        else if (event === 'fault') to = 'ERROR_RECOVERY';
        break;
      case 'EXEC_SKILL':
        if (event === 'fault') to = 'ERROR_RECOVERY';
        break;
      case 'ERROR_RECOVERY':
        if (event === 'reset') to = 'IDLE';
        else if (event === 'fatal') to = 'SAFE_STOP';
        break;
      case 'SAFE_STOP':
        // Only human operator can clear
        break;
    }
    if (to !== from) {
      this.state = to;
      this.auditLog.push({ from, to, event, timestamp: Date.now() });
    }
  }

  getState(): MissionFSMState {
    return this.state;
  }

  getAuditLog() {
    return this.auditLog;
  }
}
