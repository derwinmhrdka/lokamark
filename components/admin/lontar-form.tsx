'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { ManuscriptInput } from '@/lib/manuscripts'

export type LontarFormSubmit = {
  fields: ManuscriptInput
  imageFile: File | null
}

type LontarFormProps = {
  initial: ManuscriptInput
  submitLabel: string
  onSubmit: (data: LontarFormSubmit) => Promise<void>
  idReadOnly?: boolean
  /** Hide ID field — used on create (ID is auto-generated server-side) */
  autoId?: boolean
  existingImageUrl?: string
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
  existingImageUrl,
}: LontarFormProps) {
  const [form, setForm] = useState<ManuscriptInput>({ ...initial, image: '' })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateField<K extends keyof ManuscriptInput>(key: K, value: ManuscriptInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setImageFile(file)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(file ? URL.createObjectURL(file) : null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await onSubmit({ fields: form, imageFile })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const displayImage = previewUrl || existingImageUrl || null

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
        <div className="sm:col-span-2">
          <label htmlFor="image" className={labelClass}>
            Gambar
          </label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageChange}
            className={`${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-gold/15 file:px-3 file:py-1.5 file:text-sm file:font-medium`}
          />
          {displayImage ? (
            <div className="relative mt-3 aspect-[4/3] w-full max-w-xs overflow-hidden rounded-xl border border-border bg-muted">
              <Image
                src={displayImage}
                alt="Preview gambar lontar"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          ) : null}
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

export function buildLontarFormData(data: LontarFormSubmit) {
  const formData = new FormData()
  formData.set('id', data.fields.id)
  formData.set('name', data.fields.name)
  formData.set('category', data.fields.category)
  formData.set('institution', data.fields.institution)
  formData.set('year', data.fields.year)
  formData.set('description', data.fields.description)
  if (data.imageFile) {
    formData.set('image', data.imageFile)
  }
  return formData
}
