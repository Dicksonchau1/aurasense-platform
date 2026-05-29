"use client";
import { Card, Badge, Row } from "../../_components/SpecCard";

export default function SensorsTab() {
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:11}}>
      <Card title="Vision Stack">
        <Row label="Camera">48MP + thermal</Row>
        <Row label="Thermal">FLIR 640×512</Row>
        <Row label="Object det.">YOLO v10</Row>
        <Row label="SLAM"><Badge kind="ok">Active</Badge></Row>
        <Row label="FPS">45 fps</Row>
        <Row label="Latency">22 ms</Row>
        <Row label="FOV">84° wide</Row>
      </Card>
      <Card title="IMU / GNSS">
        <Row label="IMU">ICM-42688-P</Row>
        <Row label="GNSS">GPS/GLO/BDS</Row>
        <Row label="RTK">DJI D-RTK 2</Row>
        <Row label="Accuracy">±0.08m</Row>
        <Row label="Satellites">24</Row>
        <Row label="Fix type"><Badge kind="ok">RTK Fixed</Badge></Row>
      </Card>
      <Card title="Environment">
        <Row label="Barometer">MS5611</Row>
        <Row label="Humidity">SHT40</Row>
        <Row label="Wind speed">Ultrasonic 3D</Row>
        <Row label="AQI"><Badge kind="ok">PM2.5 OK</Badge></Row>
        <Row label="Temperature">28°C</Row>
        <Row label="Pressure">1013 hPa</Row>
      </Card>
      <Card title="LiDAR">
        <Row label="Model">Livox Mid-360</Row>
        <Row label="Range">70 m</Row>
        <Row label="FoV H/V">360° / ±55°</Row>
        <Row label="Points/s">300K</Row>
        <Row label="Frequency">10 Hz</Row>
        <Row label="Status"><Badge kind="ok">Scanning</Badge></Row>
      </Card>
      <Card title="Communication">
        <Row label="Primary">OcuSync 3 Pro</Row>
        <Row label="Backup">4G LTE</Row>
        <Row label="Range">15 km</Row>
        <Row label="Latency">110 ms</Row>
        <Row label="Encryption">AES-256</Row>
        <Row label="Signal"><Badge kind="ok">Excellent</Badge></Row>
      </Card>
      <Card title="Power">
        <Row label="Battery">TB30 77Wh</Row>
        <Row label="Voltage">22.2V nominal</Row>
        <Row label="Draw">100W avg</Row>
        <Row label="Charge time">90 min</Row>
        <Row label="Cycles">200+</Row>
        <Row label="Health"><Badge kind="ok">Good</Badge></Row>
      </Card>
    </div>
  );
}
