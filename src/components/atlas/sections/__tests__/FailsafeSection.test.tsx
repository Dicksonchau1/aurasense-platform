import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import FailsafeSection, { FailsafePanelVM } from "../FailsafeSection";

describe("FailsafeSection", () => {
  const vm: FailsafePanelVM = {
    kpis: [
      { label: "Armed", value: "No" },
      { label: "Active Failsafes", value: "1" },
      { label: "Last Trigger", value: "-" },
      { label: "Ack State", value: "idle" },
    ],
    statusChips: [
      { label: "Battery", tone: "warning" },
    ],
    timelineRows: [
      { cause: "Low Battery", actor: "operator", timestamp: "2026-05-18T12:00:00Z" },
    ],
    ackState: "idle",
  };
  it("renders KPIs and status chips", () => {
    render(
      <FailsafeSection
        vm={vm}
        onSetPolicy={jest.fn()}
        onArm={jest.fn()}
        onDisarm={jest.fn()}
        onTriggerManualFailsafe={jest.fn()}
        onAcknowledge={jest.fn()}
        onOverride={jest.fn()}
      />
    );
    expect(screen.getByText("Armed")).toBeInTheDocument();
    expect(screen.getByText("Active Failsafes")).toBeInTheDocument();
    expect(screen.getByText("Battery")).toBeInTheDocument();
    expect(screen.getByText("Low Battery")).toBeInTheDocument();
  });
  it("calls onArm when Arm button is clicked", () => {
    const onArm = jest.fn();
    render(
      <FailsafeSection
        vm={vm}
        onSetPolicy={jest.fn()}
        onArm={onArm}
        onDisarm={jest.fn()}
        onTriggerManualFailsafe={jest.fn()}
        onAcknowledge={jest.fn()}
        onOverride={jest.fn()}
      />
    );
    fireEvent.click(screen.getByText("Arm"));
    expect(onArm).toHaveBeenCalled();
  });
});
