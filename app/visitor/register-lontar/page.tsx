import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getSessionUser } from '@/lib/auth'
import { RegisterLontarForm } from './register-lontar-client'

export default async function VisitorRegisterLontarPage() {
  const user = await getSessionUser()
  if (!user || user.role !== 'visitor') redirect('/login')

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link
            href="/visitor"
            className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Kembali
          </Link>
          <h1 className="font-serif text-2xl font-bold text-foreground">Register Lontar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajukan registrasi lontar. ID digenerate otomatis (
            <span className="font-mono text-foreground">LKM-{new Date().getFullYear()}-XXX</span>
            ). Status menunggu persetujuan admin (
            <span className="font-medium text-foreground">waiting for approval</span>).
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <RegisterLontarForm />
        </div>
      </div>
    </div>
  )
}
