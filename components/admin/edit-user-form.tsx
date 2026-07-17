'use client'

import { useRouter } from 'next/navigation'
import { UserForm, type UserFormValues } from '@/components/admin/user-form'
import type { UserLogin } from '@/lib/airtable-users'

type EditUserFormProps = {
  user: UserLogin
}

export function EditUserForm({ user }: EditUserFormProps) {
  const router = useRouter()

  async function handleSubmit(values: UserFormValues) {
    const res = await fetch(`/api/admin/users/${encodeURIComponent(user.recordId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: values.email,
        role: values.role,
        password: values.password || undefined,
      }),
    })
    const json = (await res.json()) as { error?: string }
    if (!res.ok) throw new Error(json.error || 'Gagal memperbarui user')
    router.push('/admin/users')
    router.refresh()
  }

  return (
    <UserForm
      mode="edit"
      initial={{
        username: user.username,
        email: user.email,
        password: '',
        role: user.role,
      }}
      submitLabel="Simpan Perubahan"
      onSubmit={handleSubmit}
    />
  )
}
