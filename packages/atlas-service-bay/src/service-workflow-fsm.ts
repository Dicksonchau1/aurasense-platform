// 9-state FSM for service workflow
import { ServiceRequest } from './types';

type FSMState =
  | 'PENDING'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'AWAITING_TECH_CONFIRMATION'
  | 'PARTS_READY'
  | 'SERVICE_EXECUTION'
  | 'POST_SERVICE_VALIDATION'
  | 'COMPLETED'
  | 'FAILED';

interface AuditEvent {
  timestamp: number;
  from: FSMState;
  to: FSMState;
  reason?: string;
}

export class ServiceWorkflowFSM {
  private state: FSMState;
  private auditLog: AuditEvent[] = [];
  private retryCount: number = 0;
  private static readonly MAX_RETRIES = 3;

  constructor(private request: ServiceRequest) {
    this.state = 'PENDING';
  }

  transition(to: FSMState, reason?: string): void {
    const from = this.state;
    this.state = to;
    this.auditLog.push({
      timestamp: Date.now(),
      from,
      to,
      reason,
    });
    // Retry logic for recoverable states
    if (to === 'FAILED' && this.retryCount < ServiceWorkflowFSM.MAX_RETRIES) {
      this.retryCount++;
      this.state = from;
      this.auditLog.push({
        timestamp: Date.now(),
        from: 'FAILED',
        to: from,
        reason: 'Retry',
      });
    }
  }

  getState(): FSMState {
    return this.state;
  }

  getAuditLog(): AuditEvent[] {
    return this.auditLog;
  }
}
