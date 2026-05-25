import { getWorldModelClient } from 'world-model-client';
import { getStdpDebugger } from 'stdp-debug';
export class WorldModelAdapter {
    constructor() {
        this.client = getWorldModelClient();
    }
    enrich(event) {
        // Call world-model-client for enrichment
        return this.client.enrichEvent(event);
    }
}
export class StdpTraceAdapter {
    constructor() {
        this.debugger = getStdpDebugger();
    }
    inspect(traceId) {
        // Call stdp-debug for trace inspection
        return this.debugger.inspectTrace(traceId);
    }
}
