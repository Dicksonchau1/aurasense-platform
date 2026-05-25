// Envelope schema and emission utility for ATLAS → NEPA integration
import axios from "axios";

export interface Envelope {
  envelope_id: string;
  timestamp: string;
  world_id: string;
  agent_id?: string;
  event_type: string;
  payload: Record<string, any>;
  meta?: Record<string, any>;
  version?: string;
}

export async function emitEnvelopeToNepa(envelope: Envelope) {
  try {
    await axios.post("http://localhost:8000/envelope", envelope);
    // Optionally log success
  } catch (err) {
    // Handle error, retry, or log
    console.error("Failed to emit envelope to NEPA:", err);
  }
}
