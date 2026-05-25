import type {
  RegistryAsset,
  CapabilityClass,
  RegistrySource,
  AssetStatus,
  CommandProtocol,
  KinematicEnvelope,
  SovereigntyFence,
  TopologyEdge,
  TopologyGraph
} from '../../types/atlas'
import { sha256 } from '../nepa'

const registryStore: Map<string, RegistryAsset> = new Map()
const beaconLog: any[] = []

function nowISO() { return new Date().toISOString() }

function getRegistryStore(): Map<string, RegistryAsset> {
  if (registryStore.size === 0) seedAssets()
  return registryStore
}

function seedAssets() {
  const seeds: Array<Partial<RegistryAsset> & { id: string }> = [
    { id: 'UA-001', oem: 'AuraWing', model: 'AuraWing-X1', capability_class: 'AERIAL_INTERCEPT', command_protocol: 'mavlink', source: 'effector_registry', status: 'active' },
    { id: 'UA-002', oem: 'AuraWing', model: 'AuraWing-X2-ISR', capability_class: 'AERIAL_ISR', command_protocol: 'mavlink', source: 'effector_registry', status: 'idle' },
    { id: 'AR-001', oem: 'AuraWing', model: 'AuraResupply-R1', capability_class: 'AERIAL_RESUPPLY', command_protocol: 'mavlink', source: 'effector_registry', status: 'idle' },
    { id: 'GR-001', oem: 'Boston Dynamics', model: 'Spot', capability_class: 'GROUND_PATROL', command_protocol: 'ros2_nav2', source: 'effector_registry', status: 'active' },
    { id: 'GR-002', oem: 'Boston Dynamics', model: 'Spot-Breach', capability_class: 'GROUND_BREACH', command_protocol: 'ros2_nav2', source: 'effector_registry', status: 'idle' },
    { id: 'PL-001', oem: 'Siemens', model: 'S7-1200 PLC', capability_class: 'PERIMETER_LOCK', command_protocol: 'modbus', source: 'effector_registry', status: 'active' },
    { id: 'MA-001', oem: 'AuraMarine', model: 'PortTug-A1', capability_class: 'MARITIME_INTERCEPT', command_protocol: 'proprietary', source: 'effector_registry', status: 'active' },
    { id: 'MA-002', oem: 'Kongsberg', model: 'K-Mate', capability_class: 'MARITIME_ISR', command_protocol: 'proprietary', source: 'effector_registry', status: 'idle' },
    { id: 'IN-001', oem: 'Siemens', model: 'SIMATIC ET200SP', capability_class: 'INDUSTRIAL_ACTUATOR', command_protocol: 'modbus', source: 'effector_registry', status: 'active' },
    { id: 'SN-001', oem: 'SovereignSense-HK', model: 'DS-2CD2T47G2', capability_class: 'SENSOR_ONLY', command_protocol: 'proprietary', source: 'effector_registry', status: 'active' },
    { id: 'DE-001', oem: 'AuraDefence', model: 'NEPA-DE-1', capability_class: 'DIRECTED_ENERGY', command_protocol: 'udp_directed_energy', source: 'effector_registry', status: 'active' },
    { id: 'PL-002', oem: 'AuraWing', model: 'CAN-GW-1', capability_class: 'PERIMETER_LOCK', command_protocol: 'can_bus', source: 'effector_registry', status: 'active' }
  ]
  for (const s of seeds) {
    const asset: RegistryAsset = {
      ...s,
      kinematic_envelope: { max_speed_mps: 20, range_m: 1000, endurance_s: 3600 },
      sovereignty_fence: {
        jurisdiction: 'SGP-MINDEF',
        region_code: 'sgp-1',
        classification: 'RESTRICTED',
        valid_from: '2026-01-01T00:00:00Z',
        valid_until: '2099-12-31T23:59:59Z',
        engagement_rules_hash: 'hash'
      },
      battery_pct: 100,
      registered_at: nowISO(),
      last_heartbeat: nowISO(),
      signature_map_version: 'v2',
      capability_contract_hash: sha256(`${s.capability_class}:SGP-MINDEF:v2`),
      oem_integration_verified: true
    }
    registryStore.set(asset.id, asset)
  }
}

function getAllAssets(): RegistryAsset[] {
  getRegistryStore()
  return Array.from(registryStore.values())
}

function enrollAsset(req: any, operatorId: string): RegistryAsset {
  getRegistryStore()
  const id = `NEW-${Math.floor(Math.random() * 100000)}`
  const asset: RegistryAsset = {
    ...req,
    id,
    registered_at: nowISO(),
    last_heartbeat: nowISO(),
    signature_map_version: 'v2',
    capability_contract_hash: sha256(`${req.capability_class}:${req.sovereignty_fence.jurisdiction}:v2`),
    oem_integration_verified: false
  }
  registryStore.set(asset.id, asset)
  return asset
}

function updateAsset(id: string, patch: Partial<RegistryAsset>) {
  getRegistryStore()
  const asset = registryStore.get(id)
  if (!asset) throw new Error('not_found')
  Object.assign(asset, patch)
  asset.last_heartbeat = nowISO()
}

function revokeAsset(id: string) {
  getRegistryStore()
  const asset = registryStore.get(id)
  if (!asset) throw new Error('not_found')
  asset.status = 'offline'
  asset.last_heartbeat = nowISO()
}

function enrollBeaconAssets(count: number): RegistryAsset[] {
  const OEMS = ['EdgeNode-Auto','CivilDrone-Agentic','SmartSensor-IoT','PortCamera-Net','IndustrialHub-Edge']
  const assets: RegistryAsset[] = []
  for (let i = 0; i < count; i++) {
    const oem = OEMS[Math.floor(Math.random() * OEMS.length)]
    const id = `BEACON-${Math.floor(Math.random() * 100000)}`
    const asset: RegistryAsset = {
      id,
      oem,
      model: 'MeshNode',
      capability_class: 'SENSOR_ONLY',
      source: 'agentic_mobility_broker',
      status: 'unverified',
      command_protocol: 'proprietary',
      kinematic_envelope: { max_speed_mps: 0, range_m: 100, endurance_s: 3600 },
      sovereignty_fence: {
        jurisdiction: 'EMERGENCY_MESH',
        region_code: 'mesh',
        classification: 'RESTRICTED',
        valid_from: nowISO(),
        valid_until: '2099-12-31T23:59:59Z',
        engagement_rules_hash: 'hash'
      },
      registered_at: nowISO(),
      last_heartbeat: nowISO(),
      signature_map_version: 'v2',
      capability_contract_hash: sha256(`SENSOR_ONLY:EMERGENCY_MESH:v2`),
      oem_integration_verified: false
    }
    registryStore.set(asset.id, asset)
    assets.push(asset)
  }
  return assets
}

function buildTopologyGraph(): TopologyGraph {
  getRegistryStore()
  const nodes = getAllAssets()
  const edges: TopologyEdge[] = []
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j]
      if (a.capability_class === b.capability_class) {
        edges.push({ source_id: a.id, target_id: b.id, reason: 'same_capability_class' })
      } else if (a.sovereignty_fence.region_code === b.sovereignty_fence.region_code) {
        edges.push({ source_id: a.id, target_id: b.id, reason: 'same_region' })
      } else if (a.sovereignty_fence.jurisdiction === b.sovereignty_fence.jurisdiction) {
        edges.push({ source_id: a.id, target_id: b.id, reason: 'same_jurisdiction' })
      }
    }
  }
  return { nodes, edges }
}

export {
  getRegistryStore,
  getAllAssets,
  enrollAsset,
  updateAsset,
  revokeAsset,
  enrollBeaconAssets,
  buildTopologyGraph
}

// SHIM - decide real schema location and move this out of registry-store.
// Added 2026-05-26 to satisfy EditAssetSheet import.
import { z } from 'zod';
export const assetInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  type: z.string().min(1),
  status: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});
