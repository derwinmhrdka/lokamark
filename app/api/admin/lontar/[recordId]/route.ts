import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/auth'
import { getManuscriptByRecordId, updateManuscript } from '@/lib/airtable'
import { parseLontarMultipartForm } from '@/lib/lontar-form-data'

type RouteContext = {
  params: Promise<{ recordId: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdminSession()
    const { recordId } = await context.params
    const record = await getManuscriptByRecordId(recordId)
    if (!record) {
      return NextResponse.json({ error: 'Lontar tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json({ record })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    const status = message === 'Unauthorized' ? 401 : 502
    return NextResponse.json({ error: message }, { status })
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireAdminSession()
    const { recordId } = await context.params
    const { fields, image } = await parseLontarMultipartForm(request)

    if (!fields.id.trim() || !fields.name.trim()) {
      return NextResponse.json({ error: 'ID dan nama wajib diisi' }, { status: 400 })
    }

    const record = await updateManuscript(recordId, fields, user.username, {
      image: image ?? undefined,
    })
    return NextResponse.json({ record })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal memperbarui lontar'
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
