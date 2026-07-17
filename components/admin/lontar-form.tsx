'use client'

import { useState } from 'react'
import type { ManuscriptInput } from '@/lib/manuscripts'

type LontarFormProps = {
  initial: ManuscriptInput
  submitLabel: string
  onSubmit: (data: ManuscriptInput) => Promise<void>
  idReadOnly?: boolean
  /** Hide ID field — used on create (ID is auto-generated server-side) */
  autoId?: boolean
}

const inputClass =
  'w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40'

const labelClass = 'mb-1.5 block text-sm font-medium text-foreground'

export function LontarForm({
  initial,
  submitLabel,
  onSubmit,
  idReadOnly = false,
  autoId = false,
}: LontarFormProps) {
  const [form, setForm] = useState<ManuscriptInput>(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateField<K extends keyof ManuscriptInput>(key: K, value: ManuscriptInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await onSubmit(form)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!autoId ? (
        <div>
          <label htmlFor="id" className={labelClass}>
            ID Naskah *
          </label>
          <input
            id="id"
            name="id"
            required
            readOnly={idReadOnly}
            value={form.id}
            onChange={(e) => updateField('id', e.target.value.toUpperCase())}
            placeholder="LKM-2026-001"
            className={`${inputClass} font-mono uppercase tracking-wide ${idReadOnly ? 'bg-muted' : ''}`}
          />
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className={autoId ? 'sm:col-span-2' : undefined}>
          <label htmlFor="name" className={labelClass}>
            Nama Lontar *
          </label>
          <input
            id="name"
            name="name"
            required
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Lontar Usada Taru Pramana"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="category" className={labelClass}>
            Kategori
          </label>
          <input
            id="category"
            name="category"
            value={form.category}
            onChange={(e) => updateField('category', e.target.value)}
            placeholder="Pengobatan Tradisional"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="institution" className={labelClass}>
            Institusi
          </label>
          <input
            id="institution"
            name="institution"
            value={form.institution}
            onChange={(e) => updateField('institution', e.target.value)}
            placeholder="Museum Bali, Denpasar"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="year" className={labelClass}>
            Perkiraan Usia
          </label>
          <input
            id="year"
            name="year"
            value={form.year}
            onChange={(e) => updateField('year', e.target.value)}
            placeholder="Abad ke-18"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="image" className={labelClass}>
            URL Gambar
          </label>
          <input
            id="image"
            name="image"
            type="url"
            value={form.image}
            onChange={(e) => updateField('image', e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Deskripsi
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Deskripsi singkat naskah..."
          className={`${inputClass} resize-y`}
        />
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
