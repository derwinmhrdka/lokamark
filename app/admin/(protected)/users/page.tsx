import Link from 'next/link'
import { getSessionUser } from '@/lib/auth'
import { listAllUsers } from '@/lib/airtable-users'
import { UsersTable } from '@/components/admin/users-table'

export default async function UsersManagementPage() {
  const session = await getSessionUser()
  let users: Awaited<ReturnType<typeof listAllUsers>> = []
  let error: string | null = null

  try {
    users = await listAllUsers()
  } catch (err) {
    error = err instanceof Error ? err.message : 'Gagal memuat data user'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">User Management</h1>
        </div>
        <Link
          href="/admin/users/add"
          className="rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground"
        >
          Add
        </Link>
      </div>

      {error ? (
        <div className="rounded-xl border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : (
        <UsersTable users={users} currentUsername={session?.username ?? ''} />
      )}
    </div>
  )
}
