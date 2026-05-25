
import { getWorldModelClient } from 'world-model-client';
import { getStdpDebugger } from 'stdp-debug';

export class WorldModelAdapter {
  private client = getWorldModelClient();
  enrich(event: any) {
    // Call world-model-client for enrichment
    return this.client.enrichEvent(event);
  }
}

export class StdpTraceAdapter {
  private debugger = getStdpDebugger();
  inspect(traceId: string) {
    // Call stdp-debug for trace inspection
    return this.debugger.inspectTrace(traceId);
  }
}
