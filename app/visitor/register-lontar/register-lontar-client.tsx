'use client'

import { useRouter } from 'next/navigation'
import { LontarForm } from '@/components/admin/lontar-form'
import { EMPTY_MANUSCRIPT, type ManuscriptInput } from '@/lib/manuscripts'

export function RegisterLontarForm() {
  const router = useRouter()

  async function handleSubmit(data: ManuscriptInput) {
    const res = await fetch('/api/visitor/lontar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = (await res.json()) as { error?: string }
    if (!res.ok) throw new Error(json.error || 'Gagal mendaftarkan lontar')
    router.push('/visitor')
    router.refresh()
  }

  return (
    <LontarForm
      initial={EMPTY_MANUSCRIPT}
      submitLabel="Ajukan Registrasi"
      onSubmit={handleSubmit}
      autoId
    />
  )
}
