import Link from 'next/link'
import { UsersTable } from '@/components/admin/users-table'

export default function UsersManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">User Management</h1>
        </div>
        <Link
          href="/admin/users/add"
          prefetch
          className="rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground"
        >
          Add
        </Link>
      </div>
      <UsersTable />
    </div>
  )
}
