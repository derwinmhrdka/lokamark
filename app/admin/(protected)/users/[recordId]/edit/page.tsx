import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getUserByRecordId } from '@/lib/airtable-users'
import { EditUserForm } from '@/components/admin/edit-user-form'

type PageProps = {
  params: Promise<{ recordId: string }>
}

export default async function EditUserPage({ params }: PageProps) {
  const { recordId } = await params
  const user = await getUserByRecordId(recordId)
  if (!user) notFound()

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
        <h1 className="font-serif text-2xl font-bold text-foreground">Edit User</h1>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <EditUserForm user={user} />
      </div>
    </div>
  )
}
