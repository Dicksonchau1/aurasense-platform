import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import MissionCommandsSection, { MissionCommandsPanelVM } from "../MissionCommandsSection";

describe("MissionCommandsSection", () => {
  const vm: MissionCommandsPanelVM = {
    kpis: [
      { label: "Queued", value: "1" },
      { label: "Last State", value: "idle" },
      { label: "Last Error", value: "-" },
    ],
    statusChips: [
      { label: "TAKEOFF", tone: "success" },
    ],
    timelineRows: [
      { event: "TAKEOFF", actor: "operator", timestamp: "2026-05-18T12:00:00Z" },
    ],
    currentCommand: { command: "TAKEOFF", params: {}, state: "sending" },
  };
  it("renders KPIs and status chips", () => {
    render(
      <MissionCommandsSection
        vm={vm}
        onSendCommand={jest.fn()}
        onCancelCommand={jest.fn()}
        onConfirmCommand={jest.fn()}
        onRetryCommand={jest.fn()}
      />
    );
    expect(screen.getByText("Queued")).toBeInTheDocument();
    expect(screen.getByText("TAKEOFF")).toBeInTheDocument();
  });
  it("calls onCancelCommand when Cancel is clicked", () => {
    const onCancelCommand = jest.fn();
    render(
      <MissionCommandsSection
        vm={vm}
        onSendCommand={jest.fn()}
        onCancelCommand={onCancelCommand}
        onConfirmCommand={jest.fn()}
        onRetryCommand={jest.fn()}
      />
    );
    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancelCommand).toHaveBeenCalled();
  });
});
