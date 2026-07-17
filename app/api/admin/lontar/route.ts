import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/auth'
import {
  createManuscript,
  deleteManuscript,
  listAllManuscripts,
} from '@/lib/airtable'
import { parseLontarMultipartForm } from '@/lib/lontar-form-data'
import { LONTAR_STATUS_VERIFIED } from '@/lib/manuscripts'

export async function GET() {
  try {
    await requireAdminSession()
    const records = await listAllManuscripts()
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
    const { fields, image } = await parseLontarMultipartForm(request)

    const record = await createManuscript(
      { ...fields, id: '' },
      {
        status: LONTAR_STATUS_VERIFIED,
        actor: user.username,
        image: image ?? undefined,
      },
    )
    return NextResponse.json({ record }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal membuat lontar'
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireAdminSession()
    const { searchParams } = new URL(request.url)
    const recordId = searchParams.get('recordId')?.trim()
    if (!recordId) {
      return NextResponse.json({ error: 'recordId wajib diisi' }, { status: 400 })
    }

    const record = await deleteManuscript(recordId, user.username)
    return NextResponse.json({ ok: true, record })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal menonaktifkan lontar'
    const status = message === 'Unauthorized' ? 401 : 502
    return NextResponse.json({ error: message }, { status })
  }
}
