import { NextResponse } from 'next/server'
import { listSampleIds } from '@/lib/airtable'

export async function GET() {
  try {
    const ids = await listSampleIds()
    return NextResponse.json(
      {
        ids,
        source: 'airtable',
      },
      {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
      },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal memuat contoh ID'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
