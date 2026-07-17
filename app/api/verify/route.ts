import { NextResponse } from 'next/server'
import { findManuscriptById } from '@/lib/airtable'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')?.trim() ?? ''

  if (!id) {
    return NextResponse.json({ error: 'Parameter id wajib diisi' }, { status: 400 })
  }

  try {
    const manuscript = await findManuscriptById(id)

    if (!manuscript) {
      return NextResponse.json(
        {
          status: 'invalid',
          id: id.toUpperCase(),
          source: 'airtable',
        },
        {
          status: 200,
          headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
        },
      )
    }

    return NextResponse.json(
      {
        status: 'verified',
        manuscript,
        source: 'airtable',
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
      },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal memverifikasi naskah'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
