'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Landmark } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/visitor', label: 'Menu', exact: true },
  { href: '/visitor/register-lontar', label: 'Register Lontar' },
  { href: '/visitor/requests', label: 'Your Request' },
] as const

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function VisitorHeader() {
  const pathname = usePathname()

  return (
    <header className="border-b border-border bg-primary">
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gold text-gold-foreground">
              <Landmark className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-serif text-lg font-bold text-primary-foreground">LOKAMARK Visitor</p>
              <p className="text-xs text-primary-foreground/60">Registrasi lontar</p>
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-primary-foreground/20 px-3 py-2 text-sm text-primary-foreground/80 transition hover:bg-primary-foreground/10"
          >
            Situs Publik
          </Link>
        </div>

        <nav aria-label="Visitor" className="-mx-1 mt-4 flex gap-1 overflow-x-auto pb-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href, 'exact' in item ? item.exact : false)
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={
                  active
                    ? 'shrink-0 rounded-lg bg-gold px-3 py-1.5 text-sm font-semibold text-gold-foreground'
                    : 'shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-primary-foreground/75 transition hover:bg-primary-foreground/10 hover:text-primary-foreground'
                }
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
