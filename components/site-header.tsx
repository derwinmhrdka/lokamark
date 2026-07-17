import Link from 'next/link'
import { Landmark, LogIn, ShieldCheck, User } from 'lucide-react'
import { getSessionUser } from '@/lib/auth'

export async function SiteHeader() {
  const user = await getSessionUser()
  const accountHref = user?.role === 'admin' ? '/admin' : '/visitor'

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-primary/85">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gold text-gold-foreground shadow-sm">
            <Landmark className="size-5" aria-hidden="true" />
          </span>
          <div className="flex flex-col leading-none">
            <span className="font-serif text-xl font-bold tracking-wide text-primary-foreground">
              LOKAMARK
            </span>
            <span className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.18em] text-gold">
              Pelestarian Naskah Bali
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-gold/30 bg-primary-foreground/5 px-3 py-1.5 text-xs font-medium text-primary-foreground sm:flex">
            <ShieldCheck className="size-4 text-gold" aria-hidden="true" />
            Terverifikasi Digital
          </div>
          {user ? (
            <Link
              href={accountHref}
              aria-label={`Akun ${user.username}`}
              title={user.username}
              className="inline-flex size-9 items-center justify-center rounded-full border border-gold/30 bg-primary-foreground/5 text-primary-foreground transition hover:bg-primary-foreground/10"
            >
              <User className="size-4 text-gold" aria-hidden="true" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-primary-foreground/5 px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary-foreground/10"
            >
              <LogIn className="size-4 text-gold" aria-hidden="true" />
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
