"use client";

import { Card, Row, Badge } from "../../_components/SpecCard";
import { VISION_STACK, IMU_GNSS, ENV_SENSORS } from "@/lib/mock/robot-specs";

export default function SensorsTab() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
      <Card title="Vision Stack">
        {VISION_STACK.map((s) =>
          s.badge ? (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 9px", fontSize: 12 }}>
              <span style={{ color: "#8b9aae", fontWeight: 500 }}>{s.label}</span>
              <Badge kind={s.badge}>{s.value}</Badge>
            </div>
          ) : (
            <Row key={s.label} label={s.label}>{s.value}</Row>
          )
        )}
      </Card>

      <Card title="IMU + GNSS">
        {IMU_GNSS.map((s) => <Row key={s.label} label={s.label}>{s.value}</Row>)}
      </Card>

      <Card title="Environment">
        {ENV_SENSORS.map((s) =>
          s.badge ? (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 9px", fontSize: 12 }}>
              <span style={{ color: "#8b9aae", fontWeight: 500 }}>{s.label}</span>
              <Badge kind={s.badge}>{s.value}</Badge>
            </div>
          ) : (
            <Row key={s.label} label={s.label}>{s.value}</Row>
          )
        )}
      </Card>
    </div>
  );
}
