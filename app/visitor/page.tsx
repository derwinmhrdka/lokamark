import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ClipboardList, FilePlus2 } from 'lucide-react'
import { MenuLogoutButton } from '@/components/menu-logout-button'
import { getSessionUser } from '@/lib/auth'

const menuClass =
  'flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-gold/50 hover:shadow-md'

const iconWrapClass =
  'flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-foreground'

export default async function VisitorPage() {
  const user = await getSessionUser()
  if (!user || user.role !== 'visitor') redirect('/login')

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
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
    </div>
  )
}
