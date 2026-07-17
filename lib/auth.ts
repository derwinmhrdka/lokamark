import { createHmac, timingSafeEqual } from 'crypto'
import { cache } from 'react'
import { cookies } from 'next/headers'
import type { UserRole } from '@/lib/airtable-users'

export const SESSION_COOKIE = 'lokamark_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

type SessionPayload = {
  sub: string
  role: UserRole
  email: string
  exp: number
}

export type SessionUser = {
  username: string
  role: UserRole
  email: string
}

function getSecret() {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('SESSION_SECRET must be set')
  }
  return secret
}

function sign(data: string) {
  return createHmac('sha256', getSecret()).update(data).digest('base64url')
}

export function createSessionToken(user: { username: string; role: UserRole; email: string }) {
  const payload: SessionPayload = {
    sub: user.username,
    role: user.role,
    email: user.email,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  }
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${data}.${sign(data)}`
}

export function verifySessionToken(token: string): SessionUser | null {
  const [data, signature] = token.split('.')
  if (!data || !signature) return null

  const expected = sign(data)
  try {
    if (
      signature.length !== expected.length ||
      !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    ) {
      return null
    }
  } catch {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString()) as SessionPayload
    if (!payload.sub || !payload.role || payload.exp < Date.now()) return null
    if (payload.role !== 'admin' && payload.role !== 'visitor') return null
    return {
      username: payload.sub,
      role: payload.role,
      email: payload.email ?? '',
    }
  } catch {
    return null
  }
}

/** Per-request cached session lookup (dedupes layout + page). */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
})

export async function getSessionUsername(): Promise<string | null> {
  const user = await getSessionUser()
  return user?.username ?? null
}

export async function requireAdminSession(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user || user.role !== 'admin') {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireVisitorSession(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user || user.role !== 'visitor') {
    throw new Error('Unauthorized')
  }
  return user
}

export function sessionCookieOptions(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_MAX_AGE,
  }
}
