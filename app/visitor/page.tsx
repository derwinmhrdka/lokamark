import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'

export default async function VisitorPage() {
  const user = await getSessionUser()
  if (!user || user.role !== 'visitor') redirect('/login')

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Visitor Menu</h1>
          <p className="mt-1 text-sm text-muted-foreground">Halo {user.username}, pilih fitur.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/visitor/register-lontar" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="font-semibold">Register Lontar</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ajukan lontar baru — status menunggu persetujuan admin
            </p>
          </Link>
          <Link href="/visitor/requests" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="font-semibold">Your Request</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Cek status & simpan QR setelah disetujui
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
