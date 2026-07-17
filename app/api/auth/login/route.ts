import { NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/airtable-users'
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { username?: string; password?: string }
    const username = body.username?.trim() ?? ''
    const password = body.password ?? ''

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 })
    }

    const result = await authenticateUser(username, password)

    if (!result.ok) {
      if (result.reason === 'incomplete_profile') {
        return NextResponse.json(
          {
            error:
              'Profil pengguna di Airtable tidak lengkap. Pastikan semua field wajib terisi.',
          },
          { status: 403 },
        )
      }
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 })
    }

    const token = createSessionToken({
      username: result.user.username,
      role: result.user.role,
      email: result.user.email,
    })
    const response = NextResponse.json({
      ok: true,
      user: {
        username: result.user.username,
        email: result.user.email,
        role: result.user.role,
      },
    })
    response.cookies.set(sessionCookieOptions(token))
    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login gagal'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set({
    name: SESSION_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}
