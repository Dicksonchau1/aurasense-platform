// Minimal stub for world-model-client
export function getWorldModelClient() {
  return {
    enrichEvent: (event: any) => ({ ...event, confidence: 1.0 })
  };
}
