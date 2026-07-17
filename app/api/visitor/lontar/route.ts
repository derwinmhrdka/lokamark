import { NextResponse } from 'next/server'
import { createManuscript, listManuscriptsByCreatedBy } from '@/lib/airtable'
import { requireVisitorSession } from '@/lib/auth'
import { parseLontarMultipartForm } from '@/lib/lontar-form-data'
import { LONTAR_STATUS_PENDING } from '@/lib/manuscripts'

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
    const { fields, image } = await parseLontarMultipartForm(request)

    const record = await createManuscript(
      { ...fields, id: '' },
      {
        status: LONTAR_STATUS_PENDING,
        actor: user.username,
        image: image ?? undefined,
      },
    )
    return NextResponse.json({ record }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal mendaftarkan lontar'
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
