// Mock seed data for ATLAS dashboard. Replace with Supabase queries in prod.

export interface FleetEntry {
  id: string; name: string; model: string; status: "active" | "idle" | "maintenance" | "offline";
  battery: number; lastSeen: string; site: string;
}
export const FLEET: FleetEntry[] = [
  { id: "drn-01", name: "Falcon-01", model: "Skyhawk M3",  status: "active",     battery: 92, lastSeen: "12s ago",  site: "HK-COASTAL-07" },
  { id: "drn-02", name: "Falcon-02", model: "Skyhawk M3",  status: "idle",       battery: 78, lastSeen: "2m ago",   site: "Kowloon Base"  },
  { id: "drn-03", name: "Hawk-01",   model: "Skyhawk M2",  status: "active",     battery: 64, lastSeen: "8s ago",   site: "HK-COASTAL-07" },
  { id: "drn-04", name: "Hawk-02",   model: "Skyhawk M2",  status: "maintenance",battery: 0,  lastSeen: "3h ago",   site: "Workshop"      },
  { id: "drn-05", name: "Owl-01",    model: "Skyhawk Nano",status: "offline",    battery: 12, lastSeen: "1d ago",   site: "Storage"       },
];

export interface Alert {
  id: string; tick: number; severity: "info" | "warn" | "crit"; kind: string; message: string; at: string;
}
export const ALERTS: Alert[] = [
  { id: "al-01", tick: 1240, severity: "warn", kind: "anomaly",  message: "Crack A1 detected on Tower C facade", at: "03:21" },
  { id: "al-02", tick: 1820, severity: "info", kind: "battery",  message: "Falcon-02 entered idle below 80%",     at: "03:23" },
  { id: "al-03", tick: 1900, severity: "crit", kind: "geofence", message: "Falcon-01 within 25m of NFZ boundary", at: "03:24" },
  { id: "al-04", tick: 2040, severity: "info", kind: "audit",    message: "Merkle anchor mirrored to alerts svc", at: "03:25" },
];

export interface ActivityEntry { id: string; actor: string; action: string; at: string; }
export const ACTIVITY: ActivityEntry[] = [
  { id: "ac-01", actor: "dchau",      action: "created mission HK-COASTAL-07",        at: "03:15" },
  { id: "ac-02", actor: "drone-01",   action: "completed pre-flight",                  at: "03:15" },
  { id: "ac-03", actor: "drone-01",   action: "took off from Kowloon Base",            at: "03:16" },
  { id: "ac-04", actor: "nepa",       action: "flagged anomaly crack-A1 for review",   at: "03:21" },
  { id: "ac-05", actor: "dchau",      action: "approved no-go for parcel B-14 access", at: "03:23" },
];

export interface SkillRow { id: string; name: string; success: number; status: "ready" | "training"; }
export const SKILLS: SkillRow[] = [
  { id: "sk.fly.waypoint",     name: "Waypoint Nav",     success: 0.982, status: "ready" },
  { id: "sk.perc.lidar-scan",  name: "LiDAR Scan",       success: 0.940, status: "ready" },
  { id: "sk.perc.crack-detect",name: "Crack Detection",  success: 0.870, status: "training" },
  { id: "sk.plan.coverage",    name: "Coverage Plan",    success: 0.960, status: "ready" },
];

export interface AuditRow { id: string; tick: number; action: string; chainHash: string; }
export const AUDIT: AuditRow[] = [
  { id: "af-005", tick: 480,  action: "waypoint.reach:WP-03",     chainHash: "9f3a...41be" },
  { id: "af-006", tick: 720,  action: "scan.lidar:start",         chainHash: "be21...77c4" },
  { id: "af-007", tick: 1240, action: "anomaly.detect:crack-A1",  chainHash: "447c...9a02" },
  { id: "af-008", tick: 1280, action: "review.flag:crack-A1",     chainHash: "0d11...e3f7" },
];

export interface PreflightItem { key: string; label: string; ok: boolean; detail: string; }
export const PREFLIGHT: PreflightItem[] = [
  { key: "wind",      label: "Wind within limits",   ok: true,  detail: "5.2 m/s / 12 m/s max" },
  { key: "battery",   label: "Battery sufficient",   ok: true,  detail: "95% / mission needs 38 min" },
  { key: "geofence",  label: "Geofence loaded",      ok: true,  detail: "HK-COASTAL-07 v18" },
  { key: "notam",     label: "NOTAM cleared",        ok: true,  detail: "checked 04:55 HKT" },
  { key: "consent",   label: "Site access consent",  ok: false, detail: "Awaiting owner sign-off parcel B-14" },
];

export const AGENT_RESPONSES: Record<string, string> = {
  status:    "All 3 active drones nominal. Falcon-01 at 92%, Hawk-01 at 64%. No critical alerts.",
  preflight: "Pre-flight 4/5 passed. 1 blocker: site access consent for parcel B-14.",
  weather:   "Wind 5.2 m/s NE, vis > 10 km, no precip. Solar elevation 45 deg (moderate glare).",
  audit:     "Last 4 frames committed. Chain healthy. Merkle root mirrored 2 min ago.",
  default:   "I can report status, pre-flight, weather, or audit. What do you need?",
};

export const PAGE_TABS = [
  { key: "overview",   label: "Overview",     href: "/dashboard" },
  { key: "mission",    label: "Mission",      href: "/dashboard/mission-planner" },
  { key: "world",      label: "World Model",  href: "/dashboard/world-model" },
  { key: "skills",     label: "Skills",       href: "/dashboard/skills" },
  { key: "audit",      label: "Audit",        href: "/dashboard/audit" },
  { key: "compliance", label: "Compliance",   href: "/dashboard/compliance" },
  { key: "billing",    label: "Billing",      href: "/dashboard/billing" },
  { key: "settings",   label: "Settings",     href: "/dashboard/settings" },
];
