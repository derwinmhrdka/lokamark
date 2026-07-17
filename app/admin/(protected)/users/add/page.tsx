'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { UserForm, type UserFormValues } from '@/components/admin/user-form'

export default function AddUserPage() {
  const router = useRouter()

  async function handleSubmit(values: UserFormValues) {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    const json = (await res.json()) as { error?: string }
    if (!res.ok) throw new Error(json.error || 'Gagal membuat user')
    router.push('/admin/users')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/users"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali
        </Link>
        <h1 className="font-serif text-2xl font-bold text-foreground">Add User</h1>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <UserForm
          mode="create"
          initial={{ username: '', email: '', password: '', role: 'visitor' }}
          submitLabel="Simpan User"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
