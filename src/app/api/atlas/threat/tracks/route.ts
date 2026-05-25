import { NextResponse } from 'next/server'
import { envelope } from '@/lib/nepa'
import { getAllTracks, getDomainSummaries } from '@/lib/atlas/threat-store'

export async function GET() {
  const tracks = getAllTracks()
  const domain_summaries = getDomainSummaries()
  return NextResponse.json(envelope({ tracks, domain_summaries }, Date.now()))
}
