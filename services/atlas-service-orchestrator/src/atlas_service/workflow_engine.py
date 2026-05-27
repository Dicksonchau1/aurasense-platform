# FSM logic, retry, audit emission
import time

class WorkflowEngine:
    STATES = [
        'PENDING',
        'SCHEDULED',
        'IN_PROGRESS',
        'AWAITING_TECH_CONFIRMATION',
        'PARTS_READY',
        'SERVICE_EXECUTION',
        'POST_SERVICE_VALIDATION',
        'COMPLETED',
        'FAILED',
    ]

    def __init__(self, request_id=None):
        self.state = 'PENDING'
        self.audit_log = []
        self.retry_count = 0
        self.request_id = request_id

    def transition(self, new_state):
        if new_state not in self.STATES:
            raise ValueError(f"Invalid state: {new_state}")
        prev_state = self.state
        self.state = new_state
        self.emit_audit_event(prev_state, new_state)
        self.retry_count = 0

    def retry(self):
        self.retry_count += 1
        self.emit_audit_event(self.state, self.state, retry=True)

    def emit_audit_event(self, from_state, to_state, retry=False):
        event = {
            'request_id': self.request_id,
            'from': from_state,
            'to': to_state,
            'timestamp': time.time(),
            'retry': retry
        }
        self.audit_log.append(event)
        print(f"Audit: {event}")
        self.MAX_RETRIES = 3

    def transition(self, to_state, reason=None):
        from_state = self.state
        self.state = to_state
        self.audit_log.append({
            'timestamp': time.time(),
            'from': from_state,
            'to': to_state,
            'reason': reason,
        })
        # Retry logic for recoverable states
        if to_state == 'FAILED' and self.retry_count < self.MAX_RETRIES:
            self.retry_count += 1
            self.state = from_state
            self.audit_log.append({
                'timestamp': time.time(),
                'from': 'FAILED',
                'to': from_state,
                'reason': 'Retry',
            })

    def get_state(self):
        return self.state

    def get_audit_log(self):
        return self.audit_log
