'use client'

import { useRouter } from 'next/navigation'
import { LontarForm, buildLontarFormData, type LontarFormSubmit } from '@/components/admin/lontar-form'
import { EMPTY_MANUSCRIPT } from '@/lib/manuscripts'

export function RegisterLontarForm() {
  const router = useRouter()

  async function handleSubmit(data: LontarFormSubmit) {
    const res = await fetch('/api/visitor/lontar', {
      method: 'POST',
      body: buildLontarFormData(data),
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
