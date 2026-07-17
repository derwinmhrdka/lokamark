import { timingSafeEqual } from 'crypto'
import { isValidEmail, isValidUsername } from '@/lib/validation'
import { nowDateTime } from '@/lib/datetime'

export type UserRole = 'admin' | 'visitor'

export type UserLogin = {
  recordId: string
  username: string
  email: string
  role: UserRole
  createdDate?: string
  createdBy?: string
  updatedDate?: string
  updatedBy?: string
}

type UserLoginFields = {
  username?: string
  password?: string
  email?: string
  role?: string
  createdDate?: string
  createdBy?: string
  updatedDate?: string
  updatedBy?: string
}

type UserLoginRecord = {
  id: string
  fields: UserLoginFields
}

type UserLoginListResponse = {
  records?: UserLoginRecord[]
  error?: { message?: string }
}

/** Airtable table name — keep in sync with the base schema */
export const AIRTABLE_TABLE_USER_LOGIN = 'user_login'

const USER_FIELDS = [
  'username',
  'password',
  'email',
  'role',
  'createdDate',
  'createdBy',
  'updatedDate',
  'updatedBy',
] as const

function getConfig() {
  const apiKey = process.env.AIRTABLE_API_KEY
  const baseId = process.env.AIRTABLE_BASE_ID

  if (!apiKey || !baseId) {
    throw new Error('Airtable is not configured. Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID.')
  }

  return { apiKey, baseId, tableName: AIRTABLE_TABLE_USER_LOGIN }
}

function escapeFormulaString(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function passwordsMatch(stored: string, input: string) {
  if (stored.length !== input.length) return false
  try {
    return timingSafeEqual(Buffer.from(stored), Buffer.from(input))
  } catch {
    return false
  }
}

function parseRole(value: string | undefined): UserRole | null {
  const role = value?.trim().toLowerCase()
  if (role === 'admin' || role === 'visitor') return role
  return null
}

function isCompleteUser(fields: UserLoginFields): boolean {
  return Boolean(
    fields.username?.trim() && fields.password && fields.email?.trim() && parseRole(fields.role),
  )
}

function mapUser(record: UserLoginRecord): UserLogin | null {
  const fields = record.fields
  const role = parseRole(fields.role)
  if (!isCompleteUser(fields) || !role || !fields.username) return null

  return {
    recordId: record.id,
    username: fields.username.trim(),
    email: fields.email!.trim(),
    role,
    createdDate: fields.createdDate?.trim() || undefined,
    createdBy: fields.createdBy?.trim() || undefined,
    updatedDate: fields.updatedDate?.trim() || undefined,
    updatedBy: fields.updatedBy?.trim() || undefined,
  }
}

type UserLoginWriteResponse = {
  records?: UserLoginRecord[]
  error?: { message?: string }
}

export type RegisterVisitorInput = {
  username: string
  email: string
  password: string
}

async function fetchUserTable(
  path: string,
  init?: RequestInit,
): Promise<UserLoginListResponse> {
  const config = getConfig()
  const url = `https://api.airtable.com/v0/${config.baseId}/${encodeURIComponent(config.tableName)}${path}`

  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  })

  const data = (await response.json()) as UserLoginListResponse & UserLoginWriteResponse
  if (!response.ok) {
    const detail = data.error?.message || `HTTP ${response.status}`
    if (response.status === 404) {
      throw new Error(
        `Airtable table "${config.tableName}" not found (404). Create that table in your base.`,
      )
    }
    throw new Error(`Airtable request failed: ${detail}`)
  }

  return data
}

async function findUserByField(field: 'username' | 'email', value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null

  const formula =
    field === 'username'
      ? encodeURIComponent(`LOWER({username})=LOWER('${escapeFormulaString(trimmed)}')`)
      : encodeURIComponent(`{${field}}='${escapeFormulaString(trimmed)}'`)
  const data = await fetchUserTable(`?filterByFormula=${formula}&maxRecords=1&fields%5B%5D=${field}`)
  return data.records?.[0] ?? null
}

export type LoginResult =
  | { ok: true; user: UserLogin }
  | { ok: false; reason: 'invalid_credentials' | 'incomplete_profile' }

/** Authenticates against Airtable `user_login` table. */
export async function authenticateUser(username: string, password: string): Promise<LoginResult> {
  const trimmedUser = username.trim()
  if (!trimmedUser || !password) {
    return { ok: false, reason: 'invalid_credentials' }
  }

  const fieldParams = USER_FIELDS.map((f) => `fields%5B%5D=${encodeURIComponent(f)}`).join('&')
  const formula = encodeURIComponent(`{username}='${escapeFormulaString(trimmedUser)}'`)
  const data = await fetchUserTable(`?filterByFormula=${formula}&maxRecords=1&${fieldParams}`)

  const record = data.records?.[0]
  if (!record) {
    return { ok: false, reason: 'invalid_credentials' }
  }

  const storedPassword = record.fields.password
  if (typeof storedPassword !== 'string' || !passwordsMatch(storedPassword, password)) {
    return { ok: false, reason: 'invalid_credentials' }
  }

  const user = mapUser(record)
  if (!user) {
    return { ok: false, reason: 'incomplete_profile' }
  }

  return { ok: true, user }
}

/**
 * Registers a new visitor account in Airtable `user_login`.
 * Role is always set to `visitor`.
 */
export async function registerVisitorUser(input: RegisterVisitorInput): Promise<UserLogin> {
  const username = input.username.trim()
  const email = input.email.trim().toLowerCase()
  const password = input.password

  if (!username || !email || !password) {
    throw new Error('Username, email, dan password wajib diisi')
  }

  if (!isValidUsername(username)) {
    throw new Error(
      'Username 3–32 karakter, hanya huruf, angka, titik, underscore, atau tanda hubung',
    )
  }

  if (!isValidEmail(email)) {
    throw new Error('Format email tidak valid. Contoh: nama@domain.com')
  }

  if (password.length < 6) {
    throw new Error('Password minimal 6 karakter')
  }

  const existingUsername = await findUserByField('username', username)
  if (existingUsername) {
    throw new Error('Username sudah digunakan')
  }

  // Email may be shared across accounts — uniqueness is not required

  const now = nowDateTime()
  const fields: UserLoginFields = {
    username,
    email,
    password,
    role: 'visitor',
    createdDate: now,
    createdBy: username,
    updatedDate: now,
    updatedBy: username,
  }

  const data = await fetchUserTable('', {
    method: 'POST',
    body: JSON.stringify({ records: [{ fields }] }),
  })

  const record = data.records?.[0]
  const user = record ? mapUser(record) : null
  if (!user) throw new Error('Gagal membuat akun')
  return user
}
