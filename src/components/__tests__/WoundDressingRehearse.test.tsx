import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WoundDressingRehearse from "../WoundDressingRehearse";
import React from "react";

// Manual WebSocket mock
class WSStub {
  static instances: WSStub[] = [];
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  sent: any[] = [];
  readyState = 1;
  constructor() {
    WSStub.instances.push(this);
  }
  send(msg: string) {
    this.sent.push(JSON.parse(msg));
  }
  close() {
    this.readyState = 3;
    if (this.onclose) this.onclose();
  }
}

(global as any).WebSocket = WSStub;

const eventSeq = [
  { event_type: "session.start", timestamp: "2026-05-18T00:00:00Z", payload: {}, session_id: "test" },
  ...[0,1,2,3,4].map(i => ({ event_type: "step.advance", timestamp: `2026-05-18T00:00:0${i+1}Z`, payload: { step_index: i, step_name: ["Clean wound","Apply antiseptic","Place dressing","Secure dressing","Final check"][i], expected_action: ["clean_wound","apply_antiseptic","place_dressing","secure_dressing","final_check"][i] }, session_id: "test" })),
  ...[0,1,2,3,4].map(i => ({ event_type: "assessment.score", timestamp: `2026-05-18T00:00:1${i}Z`, payload: { step_index: i, score: 1.0 }, session_id: "test" })),
  { event_type: "session.complete", timestamp: "2026-05-18T00:00:20Z", payload: { passed: true, total_score: 5.0, max_score: 5.0 }, session_id: "test" },
];

describe("WoundDressingRehearse", () => {
  it("renders all steps, scores, and completion banner", async () => {
    render(<WoundDressingRehearse />);
    // Wait for WebSocket to be created
    await waitFor(() => expect(WSStub.instances.length).toBe(1));
    const ws = WSStub.instances[0];
    // Feed event sequence
    for (const evt of eventSeq) {
      await waitFor(() => ws.onmessage != null);
      ws.onmessage!({ data: JSON.stringify(evt) });
      // Simulate user confirming action for each step.advance
      if (evt.event_type === "step.advance") {
        await waitFor(() => screen.getByText(/Action Confirmed/));
        fireEvent.click(screen.getByText(/Action Confirmed/));
      }
    }
    // Check all step names rendered
    for (const name of ["Clean wound","Apply antiseptic","Place dressing","Secure dressing","Final check"]) {
      expect(screen.getAllByText(new RegExp(name)).length).toBeGreaterThanOrEqual(1);
    }
    // Check completion banner
    await waitFor(() => expect(screen.getByText(/Session Complete/)).toBeInTheDocument());
    expect(screen.getByText(/Score:\s*5(\.0)?\s*\/\s*5(\.0)?/)).toBeInTheDocument();
    // Check audit log
    fireEvent.click(screen.getByText(/Audit Log/));
    for (const evt of eventSeq) {
      // Some event types appear multiple times (e.g., step.advance, assessment.score)
      // Use getAllByText and check at least one exists
      expect(screen.getAllByText(evt.event_type).length).toBeGreaterThanOrEqual(1);
    }
  });
});




