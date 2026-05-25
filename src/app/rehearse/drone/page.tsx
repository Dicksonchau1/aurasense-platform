"use client";
import React from "react";
import { DroneInspectionScene } from "../../../components/rehearse/drone/DroneInspectionScene";

export default function RehearseDronePage() {
  // You can pass props or context as needed
  return <DroneInspectionScene structure_type="bridge" drone_position={{ x: 0, y: 0, z: 0 }} />;
}
