// Mock data for the operational dashboard hero page (/dashboard).

export type DroneStatus = "active" | "rth" | "warn" | "offline" | "standby";

export interface FleetEntry {
  id: string;
  model: string;
  status: DroneStatus;
  nerm: string;
  bat: number;
  loc: string;
  mission: string;
  hours: number;
  svc: string;
}

export const FLEET: FleetEntry[] = [
  { id: "NERM-A1", model: "DJI M30T",          status: "active",  nerm: "ZONE-N7",   bat: 87, loc: "West Kowloon", mission: "Facade-B2",     hours: 412, svc: "2026-07-10" },
  { id: "NERM-A2", model: "DJI M30T",          status: "warn",    nerm: "ZONE-N7",   bat: 18, loc: "West Kowloon", mission: "Thermal-A1",    hours: 386, svc: "2026-06-22" },
  { id: "NERM-A3", model: "DJI M350",          status: "rth",     nerm: "ZONE-E3",   bat: 34, loc: "Tsim Sha Tsui",mission: "Survey-E3",     hours: 245, svc: "2026-08-04" },
  { id: "NERM-B1", model: "DJI M350",          status: "active",  nerm: "ZONE-S2",   bat: 92, loc: "Causeway Bay", mission: "Inspect-S2",    hours: 198, svc: "2026-08-19" },
  { id: "NERM-C1", model: "Autel EVO II Pro",  status: "standby", nerm: "BASE",      bat: 100,loc: "HQ Hangar",    mission: "Idle",          hours:  82, svc: "2026-09-01" },
  { id: "NERM-C2", model: "Autel EVO II Pro",  status: "offline", nerm: "MAINT",     bat:  0, loc: "Workshop",     mission: "Service",       hours: 540, svc: "2026-05-30" },
  { id: "NERM-D1", model: "Skydio X10",        status: "active",  nerm: "ZONE-W1",   bat: 71, loc: "Sham Shui Po", mission: "Mapping-W1",    hours: 145, svc: "2026-09-15" },
];

export type AlertSeverity = "danger" | "warn" | "info";

export interface AlertItem {
  id: string;
  type: string;
  drone: string;
  msg: string;
  t: string;
  sev: AlertSeverity;
}

export const ALERTS: AlertItem[] = [
  { id: "AL-2104", type: "Battery",   drone: "NERM-A2", msg: "Below 20% during mission. RTH suggested.",           t: "09:04 HKT", sev: "warn"   },
  { id: "AL-2103", type: "Anomaly",   drone: "NERM-A1", msg: "DEF-001 spalling detected, Face N L42.",             t: "08:51 HKT", sev: "danger" },
  { id: "AL-2102", type: "Geofence",  drone: "NERM-D1", msg: "Within 25m of NFZ boundary, holding position.",      t: "08:42 HKT", sev: "danger" },
  { id: "AL-2101", type: "Wind",      drone: "NERM-A3", msg: "Gusts 12 m/s exceeding mission threshold.",          t: "08:30 HKT", sev: "warn"   },
];

export interface ActivityItem {
  i: string;
  m: string;
  t: string;
}

export const ACTIVITY: ActivityItem[] = [
  { i: "[deploy]", m: "Mission Facade-B2 dispatched to NERM-A1",            t: "08:15 HKT" },
  { i: "[ack]",    m: "Operator D.Chau acknowledged AL-2103",               t: "08:53 HKT" },
  { i: "[scan]",   m: "NERM-A1 entered SCAN-ACTIVE on Tower-B north face",  t: "08:21 HKT" },
  { i: "[rth]",    m: "NERM-A3 commanded RTH due to wind gust",             t: "08:31 HKT" },
  { i: "[cal]",    m: "NERM-A2 completed IMU calibration",                  t: "07:48 HKT" },
  { i: "[audit]",  m: "Merkle root mirrored to alerts service",             t: "07:30 HKT" },
];

export interface OpsKpi {
  label: string;
  value: string;
  badge: string;
  badgeKind: "ok" | "warn" | "danger" | "info";
  href?: string;
}

export const OPS_KPIS: OpsKpi[] = [
  { label: "Active Drones",  value: "4",     badge: "Nominal",          badgeKind: "ok"     },
  { label: "Missions Today", value: "7",     badge: "2 in progress",    badgeKind: "info"   },
  { label: "Alerts",         value: "3",     badge: "Requires attention", badgeKind: "danger", href: "/dashboard/audit" },
  { label: "Fleet Uptime",   value: "99.1%", badge: "30-day avg",       badgeKind: "ok"     },
  { label: "NEPA Score",     value: "84",    badge: "Composite",        badgeKind: "info"   },
];
