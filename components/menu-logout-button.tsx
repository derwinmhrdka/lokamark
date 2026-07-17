'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

const menuClass =
  'flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition hover:border-danger/40 hover:shadow-md'

const iconWrapClass =
  'flex size-11 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger'

export function MenuLogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/login', { method: 'DELETE' })
    router.push('/login')
    router.refresh()
  }

  return (
    <button type="button" onClick={handleLogout} className={menuClass}>
      <span className={iconWrapClass}>
        <LogOut className="size-5" aria-hidden="true" />
      </span>
      <p className="font-semibold">Logout</p>
    </button>
  )
}
