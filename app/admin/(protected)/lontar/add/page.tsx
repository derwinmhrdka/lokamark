'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { LontarForm } from '@/components/admin/lontar-form'
import { EMPTY_MANUSCRIPT, type ManuscriptInput } from '@/lib/manuscripts'

export default function AddLontarPage() {
  const router = useRouter()

  async function handleSubmit(data: ManuscriptInput) {
    const res = await fetch('/api/admin/lontar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = (await res.json()) as { error?: string }
    if (!res.ok) throw new Error(json.error || 'Gagal menyimpan lontar')
    router.push('/admin/lontar')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/lontar"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali
        </Link>
        <h1 className="font-serif text-2xl font-bold text-foreground">Add Lontar</h1>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <LontarForm
          initial={EMPTY_MANUSCRIPT}
          submitLabel="Simpan Lontar"
          onSubmit={handleSubmit}
          autoId
        />
      </div>
    </div>
  )
}
