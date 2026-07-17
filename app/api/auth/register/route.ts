import { NextResponse } from 'next/server'
import { registerVisitorUser } from '@/lib/airtable-users'
import { createSessionToken, sessionCookieOptions } from '@/lib/auth'
import { isValidEmail } from '@/lib/validation'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string
      email?: string
      password?: string
    }

    const username = body.username?.trim() ?? ''
    const email = body.email?.trim() ?? ''
    const password = body.password ?? ''

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, dan password wajib diisi' },
        { status: 400 },
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid. Contoh: nama@domain.com' },
        { status: 400 },
      )
    }

    const user = await registerVisitorUser({ username, email, password })

    const token = createSessionToken({
      username: user.username,
      role: user.role,
      email: user.email,
    })

    const response = NextResponse.json(
      {
        ok: true,
        user: {
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    )
    response.cookies.set(sessionCookieOptions(token))
    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registrasi gagal'
    const status =
      message.includes('sudah') ||
      message.includes('minimal') ||
      message.includes('wajib') ||
      message.includes('Format') ||
      message.includes('Username 3')
        ? 400
        : 500
    return NextResponse.json({ error: message }, { status })
  }
}
