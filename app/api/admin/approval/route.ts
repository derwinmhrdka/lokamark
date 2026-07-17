import { NextResponse } from 'next/server'
import { listPendingManuscripts, updateManuscriptStatus } from '@/lib/airtable'
import { requireAdminSession } from '@/lib/auth'
import { LONTAR_STATUS_INACTIVE, LONTAR_STATUS_VERIFIED } from '@/lib/manuscripts'

export async function GET() {
  try {
    await requireAdminSession()
    const records = await listPendingManuscripts()
    return NextResponse.json({ records })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    const status = message === 'Unauthorized' ? 401 : 502
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAdminSession()
    const body = (await request.json()) as {
      recordId?: string
      action?: 'approve' | 'reject'
    }
    const recordId = body.recordId?.trim()
    const action = body.action === 'reject' ? 'reject' : 'approve'

    if (!recordId) {
      return NextResponse.json({ error: 'recordId wajib diisi' }, { status: 400 })
    }

    const status = action === 'approve' ? LONTAR_STATUS_VERIFIED : LONTAR_STATUS_INACTIVE
    const record = await updateManuscriptStatus(recordId, status, user.username)
    return NextResponse.json({ record })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal memproses approval'
    const status = message === 'Unauthorized' ? 401 : 502
    return NextResponse.json({ error: message }, { status })
  }
}
