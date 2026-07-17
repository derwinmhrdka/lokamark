import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/auth'
import {
  createUserByAdmin,
  listAllUsers,
  type UserRole,
} from '@/lib/airtable-users'

export async function GET() {
  try {
    const admin = await requireAdminSession()
    const users = await listAllUsers()
    return NextResponse.json({ users, currentUsername: admin.username })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    const status = message === 'Unauthorized' ? 401 : 502
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSession()
    const body = (await request.json()) as {
      username?: string
      email?: string
      password?: string
      role?: string
    }

    const role = body.role?.trim().toLowerCase() as UserRole | undefined
    if (role !== 'admin' && role !== 'visitor') {
      return NextResponse.json({ error: 'Role harus admin atau visitor' }, { status: 400 })
    }

    const user = await createUserByAdmin(
      {
        username: body.username ?? '',
        email: body.email ?? '',
        password: body.password ?? '',
        role,
      },
      admin.username,
    )
    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal membuat user'
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
