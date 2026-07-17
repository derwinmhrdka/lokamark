'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Landmark, LogOut } from 'lucide-react'

export function AdminHeader() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/login', { method: 'DELETE' })
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="border-b border-border bg-primary">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gold text-gold-foreground">
            <Landmark className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-serif text-lg font-bold text-primary-foreground">LOKAMARK Admin</p>
            <p className="text-xs text-primary-foreground/60">Kelola data lontar</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden rounded-xl border border-primary-foreground/20 px-3 py-2 text-sm text-primary-foreground/80 transition hover:bg-primary-foreground/10 sm:inline-flex"
          >
            Situs Publik
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-primary-foreground/20 px-3 py-2 text-sm text-primary-foreground/80 transition hover:bg-primary-foreground/10"
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  )
}
