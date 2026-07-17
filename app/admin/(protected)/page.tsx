import Link from 'next/link'
import { CheckCircle2, ScrollText, Users } from 'lucide-react'
import { MenuLogoutButton } from '@/components/menu-logout-button'

const menuClass =
  'flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-gold/50 hover:shadow-md'

const iconWrapClass =
  'flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-foreground'

export default function AdminMenuPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Admin Menu</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/approval" className={menuClass}>
          <span className={iconWrapClass}>
            <CheckCircle2 className="size-5" aria-hidden="true" />
          </span>
          <p className="font-semibold">Approval</p>
        </Link>
        <Link href="/admin/lontar" className={menuClass}>
          <span className={iconWrapClass}>
            <ScrollText className="size-5" aria-hidden="true" />
          </span>
          <p className="font-semibold">Lontar Management</p>
        </Link>
        <Link href="/admin/users" className={menuClass}>
          <span className={iconWrapClass}>
            <Users className="size-5" aria-hidden="true" />
          </span>
          <p className="font-semibold">User Management</p>
        </Link>
        <MenuLogoutButton />
      </div>
    </div>
  )
}
