// Minimal stub for stdp-debug
export function getStdpDebugger() {
    return {
        inspectTrace: (traceId) => ({ traceId, delta: 1.0 })
    };
}
