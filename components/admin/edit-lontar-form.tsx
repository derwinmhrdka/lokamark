'use client'

import { useRouter } from 'next/navigation'
import { LontarForm } from '@/components/admin/lontar-form'
import type { ManuscriptInput, ManuscriptRecord } from '@/lib/manuscripts'

type EditLontarFormProps = {
  recordId: string
  initial: ManuscriptRecord
}

export function EditLontarForm({ recordId, initial }: EditLontarFormProps) {
  const router = useRouter()

  const formInitial: ManuscriptInput = {
    id: initial.id,
    name: initial.name,
    category: initial.category,
    institution: initial.institution,
    year: initial.year,
    description: initial.description,
    image: initial.image === '/placeholder.svg' ? '' : initial.image,
  }

  async function handleSubmit(data: ManuscriptInput) {
    const res = await fetch(`/api/admin/lontar/${encodeURIComponent(recordId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = (await res.json()) as { error?: string }
    if (!res.ok) throw new Error(json.error || 'Gagal memperbarui lontar')

    router.push('/admin/lontar')
    router.refresh()
  }

  return (
    <LontarForm
      initial={formInitial}
      submitLabel="Simpan Perubahan"
      onSubmit={handleSubmit}
      idReadOnly
    />
  )
}
