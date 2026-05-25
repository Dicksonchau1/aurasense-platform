import type {
  ThreatTrack,
  ThreatDomain,
  ThreatState,
  SensorModality,
  SovereigntyFence,
  EngagementPolicyEval,
  EngagementAuthorityToken,
  DomainSummary
} from '../../../types/atlas-threat'
import { sha256 } from '../nepa'
import crypto from 'crypto'

// Module-level stores
const trackStore: Map<string, ThreatTrack> = new Map()
const authorityLog: EngagementAuthorityToken[] = []

// --- Helper functions ---
function nowISO() {
  return new Date().toISOString()
}

function deterministicGeo(domain: ThreatDomain, idx: number) {
  // Mock geo for each domain/track
  if (domain === 'airspace') return { lat: 1.3422 + idx * 0.001, lng: 103.8198 + idx * 0.001 }
  if (domain === 'maritime') return { lat: 1.2700 + idx * 0.002, lng: 103.8500 + idx * 0.002 }
  return { lat: 1.3000 + idx * 0.001, lng: 103.8000 + idx * 0.001 }
}

function computeRowHash(track: Partial<ThreatTrack>) {
  return sha256(
    JSON.stringify({
      id: track.id,
      domain: track.domain,
      threat_state: track.threat_state,
      sources: track.sources,
      confidence: track.confidence,
      lat: track.lat,
      lng: track.lng,
      sovereignty_fence: track.sovereignty_fence,
      last_updated: track.last_updated
    })
  )
}

function getTrackStore(): Map<string, ThreatTrack> {
  if (trackStore.size === 0) {
    // Seed 9 tracks (3 per domain)
    const domains: ThreatDomain[] = ['airspace', 'maritime', 'ground']
    let idx = 1
    for (const domain of domains) {
      for (let i = 0; i < 3; i++) {
        const overrides = (domain === 'airspace' && i === 0)
          ? {
              classification: 'UAV_SWARM',
              sources: ['event_camera','radar_primary','adsb'],
              threat_state: 'tracked',
              formation_geometry: 'V_FORMATION',
              behavioural_signals: {
                coordinated_manoeuvre: true,
                altitude_cycling: true,
                rf_silence: true,
                counter_clockwise_rotation: true,
                speed_variance_low: true
              },
              sovereignty_fence: {
                jurisdiction: 'SGP-MINDEF',
                region_code: 'sgp-air-1',
                classification: 'RESTRICTED',
                valid_until: '2099-12-31T23:59:59Z'
              }
            }
          : undefined
        const track = seedTrack(domain, overrides, idx)
        trackStore.set(track.id, track)
        idx++
      }
    }
  }
  return trackStore
}

function seedTrack(domain: ThreatDomain, overrides?: Partial<ThreatTrack>, idx?: number): ThreatTrack {
  const i = idx || Math.floor(Math.random() * 1000)
  const id =
    domain === 'airspace' ? `TRK-A-${String(i).padStart(3, '0')}` :
    domain === 'maritime' ? `TRK-M-${String(i).padStart(3, '0')}` :
    `TRK-G-${String(i).padStart(3, '0')}`
  const geo = deterministicGeo(domain, i)
  const base: ThreatTrack = {
    id,
    domain,
    threat_state: 'nominal',
    sources:
      domain === 'airspace' ? ['event_camera','radar_primary','adsb'] :
      domain === 'maritime' ? ['ais','radar_secondary'] :
      ['seismic','acoustic','rf_spectrum'],
    confidence: 0.84,
    lat: geo.lat,
    lng: geo.lng,
    sovereignty_fence: {
      jurisdiction: 'SGP-MINDEF',
      region_code: domain === 'airspace' ? 'sgp-air-1' : domain === 'maritime' ? 'sgp-sea-1' : 'sgp-grd-1',
      classification: 'RESTRICTED',
      valid_until: '2099-12-31T23:59:59Z'
    },
    state_history: [{ state: 'nominal', ts: nowISO() }],
    last_updated: nowISO(),
    row_hash: '',
  }
  const merged = { ...base, ...overrides }
  merged.row_hash = computeRowHash(merged)
  return merged
}

function ingestAnomalyEvent(evt: any): ThreatTrack | null {
  getTrackStore()
  if (evt.score > 0.85 && !trackStore.has(evt.id)) {
    // New track
    const track = seedTrack(evt.domain as ThreatDomain, {
      id: evt.id,
      threat_state: 'detected',
      confidence: evt.score,
      sources: evt.sources || ['event_camera'],
      lat: evt.lat,
      lng: evt.lng,
      anomaly_source_id: evt.id,
      last_updated: nowISO(),
      state_history: [{ state: 'detected', ts: nowISO() }]
    })
    track.row_hash = computeRowHash(track)
    trackStore.set(track.id, track)
    return track
  }
  if (trackStore.has(evt.id)) {
    const track = trackStore.get(evt.id)!
    if (evt.score > track.confidence) {
      // Advance state one step
      const nextState = advanceState(track.threat_state)
      if (nextState) {
        track.threat_state = nextState
        track.confidence = evt.score
        track.last_updated = nowISO()
        track.state_history.push({ state: nextState, ts: nowISO() })
        track.row_hash = computeRowHash(track)
        return track
      }
    }
  }
  return null
}

function advanceState(state: ThreatState): ThreatState | null {
  const order: ThreatState[] = ['nominal','detected','classified','tracked','engaged','resolved']
  const idx = order.indexOf(state)
  return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null
}

function advanceThreatState(trackId: string, to: ThreatState, operatorId: string, auditId: string) {
  getTrackStore()
  const track = trackStore.get(trackId)
  if (!track) throw new Error('not_found')
  const order: ThreatState[] = ['nominal','detected','classified','tracked','engaged','resolved']
  const idx = order.indexOf(track.threat_state)
  const toIdx = order.indexOf(to)
  if (toIdx !== idx + 1) throw new Error('invalid_transition')
  track.threat_state = to
  track.last_updated = nowISO()
  track.state_history.push({ state: to, ts: nowISO(), operator_id: operatorId, audit_id: auditId })
  track.row_hash = computeRowHash(track)
}

function evaluateEngagementPolicy(track: ThreatTrack, sovereignty_fence: SovereigntyFence): EngagementPolicyEval {
  const rules_checked = [
    'fence_jurisdiction_match',
    'threat_state_sufficient',
    'confidence_threshold',
    'collateral_risk_acceptable',
    'classification_known'
  ]
  const rules_passed: string[] = []
  const rules_failed: string[] = []
  // 1. fence_jurisdiction_match
  if (track.sovereignty_fence.jurisdiction === sovereignty_fence.jurisdiction) rules_passed.push('fence_jurisdiction_match')
  else rules_failed.push('fence_jurisdiction_match')
  // 2. threat_state_sufficient
  if (track.threat_state === 'tracked') rules_passed.push('threat_state_sufficient')
  else rules_failed.push('threat_state_sufficient')
  // 3. confidence_threshold
  if (track.confidence >= 0.70) rules_passed.push('confidence_threshold')
  else rules_failed.push('confidence_threshold')
  // 4. collateral_risk_acceptable
  let collateral_risk: 'low' | 'medium' | 'high' = 'low'
  if (track.formation_geometry === 'V_FORMATION' && (track.altitude_m || 0) > 150) collateral_risk = 'medium'
  if (track.classification === 'UAV_SWARM' && (track.speed_mps || 0) > 25) collateral_risk = 'high'
  if (collateral_risk === 'low' || collateral_risk === 'medium') rules_passed.push('collateral_risk_acceptable')
  else rules_failed.push('collateral_risk_acceptable')
  // 5. classification_known
  if (track.classification) rules_passed.push('classification_known')
  else rules_failed.push('classification_known')
  const verdict: EngagementPolicyEval['verdict'] = rules_failed.length === 0 ? 'approved' : (rules_failed.includes('fence_jurisdiction_match') ? 'denied_fence' : 'denied_policy')
  return {
    verdict,
    rules_checked,
    rules_passed,
    rules_failed,
    fence_valid: rules_passed.includes('fence_jurisdiction_match'),
    collateral_risk
  }
}

function issueEngagementAuthority(trackId: string, operatorId: string, sovereigntyFence: SovereigntyFence, token: string, auditId: string) {
  getTrackStore()
  const track = trackStore.get(trackId)
  if (!track) throw new Error('not_found')
  // Advance to engaged
  const order: ThreatState[] = ['nominal','detected','classified','tracked','engaged','resolved']
  const idx = order.indexOf(track.threat_state)
  if (idx !== 3) throw new Error('invalid_transition') // must be tracked
  track.threat_state = 'engaged'
  track.last_updated = nowISO()
  track.state_history.push({ state: 'engaged', ts: nowISO(), operator_id: operatorId, audit_id: auditId })
  track.row_hash = computeRowHash(track)
  // Mock MAVLink frame
  const command_frame = 'FD 09 00 00 00 00 00 04 B4 00 ' + crypto.randomBytes(9).toString('hex').toUpperCase()
  const exp_unix = Math.floor(Date.now()/1000) + 120
  const record: EngagementAuthorityToken = {
    track_id: trackId,
    token,
    sovereignty_fence: sovereigntyFence.jurisdiction,
    audit_id: auditId,
    operator_id: operatorId,
    issued_at: nowISO(),
    expires_at: new Date(Date.now() + 120000).toISOString(),
    exp_unix,
    mavlink_command_dispatched: true,
    command_frame
  }
  authorityLog.unshift(record)
  if (authorityLog.length > 50) authorityLog.pop()
  return record
}

function getAuthorityLog() {
  return authorityLog
}
function getAllTracks() {
  getTrackStore()
  return Array.from(trackStore.values())
}
function getDomainSummaries(): DomainSummary[] {
  getTrackStore()
  const domains: ThreatDomain[] = ['airspace','ground','maritime']
  return domains.map(domain => {
    const tracks = Array.from(trackStore.values()).filter(t => t.domain === domain)
    const highest_state = tracks.reduce((acc, t) => {
      const order = ['nominal','detected','classified','tracked','engaged','resolved']
      return order.indexOf(t.threat_state) > order.indexOf(acc) ? t.threat_state : acc
    }, 'nominal' as ThreatState)
    const engaged_count = tracks.filter(t => t.threat_state === 'engaged').length
    return {
      domain,
      track_count: tracks.length,
      highest_state,
      has_new_events: false,
      engaged_count
    }
  })
}

export {
  getTrackStore,
  seedTrack,
  ingestAnomalyEvent,
  advanceThreatState,
  evaluateEngagementPolicy,
  issueEngagementAuthority,
  getAuthorityLog,
  getAllTracks,
  getDomainSummaries
}
