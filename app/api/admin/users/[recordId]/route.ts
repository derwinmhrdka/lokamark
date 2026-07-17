import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/auth'
import {
  deleteUserByAdmin,
  getUserByRecordId,
  updateUserByAdmin,
  type UserRole,
} from '@/lib/airtable-users'

type RouteContext = {
  params: Promise<{ recordId: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdminSession()
    const { recordId } = await context.params
    const user = await getUserByRecordId(recordId)
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json({ user })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    const status = message === 'Unauthorized' ? 401 : 502
    return NextResponse.json({ error: message }, { status })
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireAdminSession()
    const { recordId } = await context.params
    const body = (await request.json()) as {
      email?: string
      role?: string
      password?: string
    }

    const role = body.role?.trim().toLowerCase() as UserRole | undefined
    if (role !== 'admin' && role !== 'visitor') {
      return NextResponse.json({ error: 'Role harus admin atau visitor' }, { status: 400 })
    }

    const user = await updateUserByAdmin(
      recordId,
      {
        email: body.email ?? '',
        role,
        password: body.password?.trim() ? body.password : undefined,
      },
      admin.username,
    )
    return NextResponse.json({ user })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal memperbarui user'
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const admin = await requireAdminSession()
    const { recordId } = await context.params

    const target = await getUserByRecordId(recordId)
    if (!target) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    if (target.username.toLowerCase() === admin.username.toLowerCase()) {
      return NextResponse.json({ error: 'Tidak dapat menghapus akun Anda sendiri' }, { status: 400 })
    }

    await deleteUserByAdmin(recordId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal menghapus user'
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
