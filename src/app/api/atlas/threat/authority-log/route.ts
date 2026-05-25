import { NextResponse } from 'next/server'
import { getAuthorityLog } from '@/lib/atlas/threat-store'
import { envelope } from '@/lib/nepa'

export async function GET() {
  const t = Date.now()
  return NextResponse.json(envelope({ tokens: getAuthorityLog(), total: getAuthorityLog().length }, t))
}