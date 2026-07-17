import Link from 'next/link'
import { ClipboardList, FilePlus2 } from 'lucide-react'
import { MenuLogoutButton } from '@/components/menu-logout-button'

const menuClass =
  'flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-gold/50 hover:shadow-md'

const iconWrapClass =
  'flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-foreground'

export default function VisitorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Visitor Menu</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/visitor/register-lontar" className={menuClass}>
          <span className={iconWrapClass}>
            <FilePlus2 className="size-5" aria-hidden="true" />
          </span>
          <p className="font-semibold">Register Lontar</p>
        </Link>
        <Link href="/visitor/requests" className={menuClass}>
          <span className={iconWrapClass}>
            <ClipboardList className="size-5" aria-hidden="true" />
          </span>
          <p className="font-semibold">Your Request</p>
        </Link>
        <MenuLogoutButton />
      </div>
    </div>
  )
}
