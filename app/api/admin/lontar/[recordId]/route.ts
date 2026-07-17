import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/auth'
import { getManuscriptByRecordId, updateManuscript } from '@/lib/airtable'
import type { ManuscriptInput } from '@/lib/manuscripts'

function parseInput(body: unknown): ManuscriptInput | null {
  if (!body || typeof body !== 'object') return null
  const data = body as Record<string, unknown>
  const id = typeof data.id === 'string' ? data.id : ''
  const name = typeof data.name === 'string' ? data.name : ''
  if (!id.trim() || !name.trim()) return null

  return {
    id,
    name,
    category: typeof data.category === 'string' ? data.category : '',
    institution: typeof data.institution === 'string' ? data.institution : '',
    year: typeof data.year === 'string' ? data.year : '',
    description: typeof data.description === 'string' ? data.description : '',
    image: typeof data.image === 'string' ? data.image : '',
  }
}

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
    const input = parseInput(await request.json())
    if (!input) {
      return NextResponse.json({ error: 'ID dan nama wajib diisi' }, { status: 400 })
    }

    const record = await updateManuscript(recordId, input, user.username)
    return NextResponse.json({ record })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal memperbarui lontar'
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
