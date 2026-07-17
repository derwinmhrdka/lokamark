import { NextResponse } from 'next/server'
import { createManuscript, listManuscriptsByCreatedBy } from '@/lib/airtable'
import { requireVisitorSession } from '@/lib/auth'
import { LONTAR_STATUS_PENDING, type ManuscriptInput } from '@/lib/manuscripts'

function parseCreateInput(body: unknown): Omit<ManuscriptInput, 'id'> | null {
  if (!body || typeof body !== 'object') return null
  const data = body as Record<string, unknown>
  const name = typeof data.name === 'string' ? data.name : ''
  if (!name.trim()) return null

  return {
    name,
    category: typeof data.category === 'string' ? data.category : '',
    institution: typeof data.institution === 'string' ? data.institution : '',
    year: typeof data.year === 'string' ? data.year : '',
    description: typeof data.description === 'string' ? data.description : '',
    image: typeof data.image === 'string' ? data.image : '',
  }
}

export async function GET() {
  try {
    const user = await requireVisitorSession()
    const records = await listManuscriptsByCreatedBy(user.username)
    return NextResponse.json({ records })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    const status = message === 'Unauthorized' ? 401 : 502
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireVisitorSession()
    const parsed = parseCreateInput(await request.json())
    if (!parsed) {
      return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 })
    }

    const record = await createManuscript(
      { ...parsed, id: '' },
      {
        status: LONTAR_STATUS_PENDING,
        actor: user.username,
      },
    )
    return NextResponse.json({ record }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal mendaftarkan lontar'
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
