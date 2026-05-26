// Skill Library data - 7 hero skills (1 mature, highest-impact per category).
// Wire this into /dashboard/skills and /dashboard/skill-composer.

export type SkillCategory =
  | "aerial"
  | "ground"
  | "indoor"
  | "delivery"
  | "sensor"
  | "nerm"
  | "safety";

export type SkillStatus = "active" | "beta" | "draft";

export type SkillParam =
  | { key: string; label: string; type: "range"; min: number; max: number; val: number; suffix?: string }
  | { key: string; label: string; type: "toggle"; val: boolean }
  | { key: string; label: string; type: "select"; opts: string[]; val: string }
  | { key: string; label: string; type: "text";   val: string };

export interface Skill {
  id: string;
  name: string;
  cat: SkillCategory;
  icon: string;           // lucide icon name (e.g. "plane", "bot")
  color: string;          // hex without #
  status: SkillStatus;
  ver: string;
  desc: string;
  tags: string[];
  robots: string[];
  params: SkillParam[];
  nermContext: boolean;   // true if skill consumes NERM context
  stdpWeight: number;     // 0..1, used by the composer's generated script
}

export const SKILLS: Skill[] = [
  // ---------- AERIAL ----------
  {
    id: "waypointnav",
    name: "Waypoint Navigation",
    cat: "aerial",
    icon: "plane",
    color: "0891b2",
    status: "active",
    ver: "v3.1",
    desc: "GPS + RTK guided multi-waypoint flight with obstacle detection and dynamic re-routing. Backbone of every aerial mission.",
    tags: ["navigation", "rtk", "obstacle-avoidance"],
    robots: ["DJI M30", "DJI M350", "Any Aerial"],
    nermContext: true,
    stdpWeight: 0.88,
    params: [
      { key: "speed",      label: "Flight Speed (m/s)",   type: "range",  min: 1,  max: 15,  val: 7,  suffix: " m/s" },
      { key: "alt",        label: "Cruise Altitude (m)",  type: "range",  min: 10, max: 200, val: 50, suffix: " m"   },
      { key: "avoidance",  label: "Obstacle Avoidance",   type: "toggle", val: true },
      { key: "rtkmode",    label: "RTK Mode",             type: "select", opts: ["Fix", "Float", "DGPS"], val: "Fix" },
    ],
  },

  // ---------- GROUND ----------
  {
    id: "groundnav",
    name: "Ground Navigation",
    cat: "ground",
    icon: "navigation",
    color: "16a34a",
    status: "active",
    ver: "v4.2",
    desc: "SLAM-based autonomous navigation for outdoor ground robots with terrain adaptation and visual + LiDAR sensor fusion.",
    tags: ["slam", "outdoor", "terrain", "fusion"],
    robots: ["Unitree B2", "AMR-D200", "Spot"],
    nermContext: true,
    stdpWeight: 0.91,
    params: [
      { key: "speed",   label: "Max Speed (m/s)", type: "range",  min: 0.5, max: 3,    val: 1.2, suffix: " m/s" },
      { key: "terrain", label: "Terrain Mode",    type: "select", opts: ["Flat", "Uneven", "Slope"], val: "Flat" },
      { key: "slam",    label: "SLAM Mode",       type: "select", opts: ["LiDAR", "Visual", "Fusion"], val: "Fusion" },
    ],
  },

  // ---------- INDOOR ----------
  {
    id: "indoornav",
    name: "Indoor Navigation",
    cat: "indoor",
    icon: "building-2",
    color: "7c3aed",
    status: "active",
    ver: "v3.5",
    desc: "Floor-plan-aware indoor navigation with room lookup, door handling, and IoT-integrated lift rides.",
    tags: ["indoor", "slam", "lift", "door"],
    robots: ["AMR-D200", "H1 Humanoid"],
    nermContext: true,
    stdpWeight: 0.84,
    params: [
      { key: "speed",   label: "Speed (m/s)",    type: "range",  min: 0.3, max: 1.5, val: 0.6, suffix: " m/s" },
      { key: "floor",   label: "Target Floor",   type: "select", opts: ["L1", "L2", "L3"], val: "L1" },
      { key: "lift",    label: "Use Elevator",   type: "toggle", val: true },
      { key: "doormode",label: "Door Handling",  type: "select", opts: ["Auto", "Manual", "Skip"], val: "Auto" },
    ],
  },

  // ---------- DELIVERY ----------
  {
    id: "indoordelivery",
    name: "Indoor Delivery",
    cat: "delivery",
    icon: "package",
    color: "ea580c",
    status: "active",
    ver: "v3.2",
    desc: "Room-to-room delivery composing nav, door handling, lift rides, and recipient confirmation. Highest-leverage composed skill.",
    tags: ["delivery", "indoor", "recipient", "composed"],
    robots: ["AMR-D200", "H1 Humanoid"],
    nermContext: true,
    stdpWeight: 0.86,
    params: [
      { key: "pickuproom",  label: "Pickup Room",        type: "text",   val: "Lobby" },
      { key: "dropoffroom", label: "Dropoff Room",       type: "text",   val: "Ward 3B" },
      { key: "confirm",     label: "Recipient Confirm",  type: "toggle", val: true },
      { key: "priority",    label: "Priority",           type: "select", opts: ["Normal", "High", "Critical"], val: "Normal" },
    ],
  },

  // ---------- SENSOR ----------
  {
    id: "lidarmap",
    name: "LiDAR Mapping",
    cat: "sensor",
    icon: "scan",
    color: "d97706",
    status: "active",
    ver: "v3.3",
    desc: "3D point cloud capture and incremental World Model update via Livox / Velodyne. Feeds the live world model for inspection clients.",
    tags: ["lidar", "pointcloud", "mapping", "world-model"],
    robots: ["DJI M30", "AMR-D200"],
    nermContext: true,
    stdpWeight: 0.79,
    params: [
      { key: "density",     label: "Point Density",        type: "select", opts: ["100k/s", "300k/s", "1M/s"], val: "300k/s" },
      { key: "range",       label: "Max Range (m)",         type: "range",  min: 10, max: 200, val: 70, suffix: " m" },
      { key: "updateworld", label: "Update World Model",    type: "toggle", val: true },
    ],
  },

  // ---------- NERM ----------
  {
    id: "nermdecide",
    name: "NERM Decision Gate",
    cat: "nerm",
    icon: "git-branch",
    color: "4f46e5",
    status: "active",
    ver: "v2.1",
    desc: "Conditional branch - NERM confidence score gates next skill execution. Lets composer chains branch instead of being linear.",
    tags: ["nerm", "decision", "gate", "branch"],
    robots: ["Any"],
    nermContext: true,
    stdpWeight: 0.94,
    params: [
      { key: "threshold", label: "Confidence Threshold (%)", type: "range",  min: 50, max: 99, val: 80, suffix: "%" },
      { key: "onfail",    label: "On Fail",                  type: "select", opts: ["Retry", "Skip", "Abort"], val: "Retry" },
      { key: "logging",   label: "Verbose Logging",          type: "toggle", val: false },
    ],
  },

  // ---------- SAFETY ----------
  {
    id: "collisionavoid",
    name: "Collision Avoidance",
    cat: "safety",
    icon: "shield",
    color: "dc2626",
    status: "active",
    ver: "v3.2",
    desc: "Real-time multi-sensor collision prediction with dynamic path replanning. Required by HKCAD and insurers for outdoor flight.",
    tags: ["safety", "collision", "replan", "hkcad"],
    robots: ["All Mobile"],
    nermContext: false,
    stdpWeight: 0.97,
    params: [
      { key: "margin",   label: "Safety Margin (cm)",   type: "range",  min: 10, max: 100, val: 30, suffix: " cm" },
      { key: "hardstop", label: "Hard Stop on Fail",    type: "toggle", val: true },
      { key: "scope",    label: "Detection Scope",      type: "select", opts: ["Front", "360", "Volumetric"], val: "360" },
    ],
  },
];

// Category metadata - sidebar chip colours + display names.
export interface CategoryMeta {
  key: SkillCategory;
  label: string;
  color: string;
}

export const CATEGORY_META: CategoryMeta[] = [
  { key: "aerial",   label: "Aerial",   color: "0891b2" },
  { key: "ground",   label: "Ground",   color: "16a34a" },
  { key: "indoor",   label: "Indoor",   color: "7c3aed" },
  { key: "delivery", label: "Delivery", color: "ea580c" },
  { key: "sensor",   label: "Sensor",   color: "d97706" },
  { key: "nerm",     label: "NERM",     color: "4f46e5" },
  { key: "safety",   label: "Safety",   color: "dc2626" },
];

// Status pill colour + label.
export interface StatusMeta {
  key: SkillStatus;
  label: string;
  pillColor: string;
}

export const STATUS_META: Record<SkillStatus, StatusMeta> = {
  active: { key: "active", label: "Active", pillColor: "16a34a" },
  beta:   { key: "beta",   label: "Beta",   pillColor: "d97706" },
  draft:  { key: "draft",  label: "Draft",  pillColor: "6b7280" },
};
