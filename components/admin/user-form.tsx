'use client'

import { useState } from 'react'
import type { UserRole } from '@/lib/airtable-users'
import { isValidEmail } from '@/lib/validation'

export type UserFormValues = {
  username: string
  email: string
  password: string
  role: UserRole
}

type UserFormProps = {
  mode: 'create' | 'edit'
  initial: UserFormValues
  submitLabel: string
  onSubmit: (values: UserFormValues) => Promise<void>
}

const inputClass =
  'w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40'

const labelClass = 'mb-1.5 block text-sm font-medium text-foreground'

export function UserForm({ mode, initial, submitLabel, onSubmit }: UserFormProps) {
  const [form, setForm] = useState<UserFormValues>(initial)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!isValidEmail(form.email)) {
        throw new Error('Format email tidak valid. Contoh: nama@domain.com')
      }

      const passwordRequired = mode === 'create'
      if (passwordRequired && !form.password) {
        throw new Error('Password wajib diisi')
      }

      if (form.password) {
        if (form.password.length < 6) {
          throw new Error('Password minimal 6 karakter')
        }
        if (form.password !== confirmPassword) {
          throw new Error('Konfirmasi password tidak cocok')
        }
      }

      await onSubmit(form)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="username" className={labelClass}>
            Username *
          </label>
          <input
            id="username"
            name="username"
            required
            readOnly={mode === 'edit'}
            minLength={3}
            maxLength={32}
            pattern="[a-zA-Z0-9._\-]+"
            value={form.username}
            onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            className={`${inputClass} ${mode === 'edit' ? 'bg-muted' : ''}`}
          />
        </div>
        <div>
          <label htmlFor="role" className={labelClass}>
            Role *
          </label>
          <select
            id="role"
            name="role"
            required
            value={form.role}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, role: e.target.value as UserRole }))
            }
            className={inputClass}
          >
            <option value="visitor">visitor</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="email" className={labelClass}>
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="password" className={labelClass}>
            Password {mode === 'create' ? '*' : '(opsional)'}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required={mode === 'create'}
            minLength={mode === 'create' ? 6 : undefined}
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            placeholder={mode === 'edit' ? 'Kosongkan jika tidak diubah' : undefined}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className={labelClass}>
            Konfirmasi Password {mode === 'create' ? '*' : ''}
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required={mode === 'create' || Boolean(form.password)}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-gold-foreground transition hover:brightness-95 disabled:opacity-60"
      >
        {loading ? 'Menyimpan…' : submitLabel}
      </button>
    </form>
  )
}
