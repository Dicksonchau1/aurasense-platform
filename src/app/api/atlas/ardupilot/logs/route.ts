import { NextResponse } from 'next/server'
import { envelope } from '@/src/lib/audit-chain'
import { ArdupilotLog } from '@/src/types/ardupilot'

const SEEDED_LOGS: ArdupilotLog[] = [
  { id:'log-2041', filename:'2026-05-19-001.bin', vehicle_id:'UA-001',
    duration_s: 1847, start_ts: new Date(Date.now()-86400000).toISOString(),
    end_ts: new Date(Date.now()-86400000+1847000).toISOString(),
    size_bytes: 4_200_000, row_count: 55410,
    has_anomalies: true, anomaly_count: 3 },
  { id:'log-2042', filename:'2026-05-18-002.bin', vehicle_id:'UA-002',
    duration_s: 924, start_ts: new Date(Date.now()-172800000).toISOString(),
    end_ts: new Date(Date.now()-172800000+924000).toISOString(),
    size_bytes: 2_100_000, row_count: 27720,
    has_anomalies: false, anomaly_count: 0 },
  { id:'log-2043', filename:'2026-05-17-001.bin', vehicle_id:'UA-001',
    duration_s: 3612, start_ts: new Date(Date.now()-259200000).toISOString(),
    end_ts: new Date(Date.now()-259200000+3612000).toISOString(),
    size_bytes: 8_400_000, row_count: 108360,
    has_anomalies: true, anomaly_count: 7 },
  { id:'log-2044', filename:'2026-05-16-003.bin', vehicle_id:'GR-001',
    duration_s: 2741, start_ts: new Date(Date.now()-345600000).toISOString(),
    end_ts: new Date(Date.now()-345600000+2741000).toISOString(),
    size_bytes: 6_300_000, row_count: 82230,
    has_anomalies: true, anomaly_count: 1 },
  { id:'log-2045', filename:'2026-05-15-001.bin', vehicle_id:'UA-004',
    duration_s: 612, start_ts: new Date(Date.now()-432000000).toISOString(),
    end_ts: new Date(Date.now()-432000000+612000).toISOString(),
    size_bytes: 1_400_000, row_count: 18360,
    has_anomalies: false, anomaly_count: 0 },
]

export async function GET() {
  return NextResponse.json(envelope({ logs: SEEDED_LOGS }))
}