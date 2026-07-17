import { Sparkles } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { VerifyWorkspace } from '@/components/verify-workspace'
import { VerifiedLontarCatalog } from '@/components/verified-lontar-catalog'
import { listVerifiedManuscripts } from '@/lib/airtable'

export default async function Page() {
  let manuscripts: Awaited<ReturnType<typeof listVerifiedManuscripts>> = []
  try {
    manuscripts = await listVerifiedManuscripts()
  } catch {
    manuscripts = []
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <section className="py-8 text-center sm:py-12">
          <h1 className="mt-4 font-serif text-3xl font-bold leading-tight text-foreground text-balance sm:text-4xl">
            Verifikasi Keaslian Naskah Kuno Bali
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base text-pretty">
            Pindai QR Code atau masukkan ID naskah untuk memverifikasi keasliannya.
          </p>
        </section>

        <VerifyWorkspace />

        <div className="mt-12">
          <VerifiedLontarCatalog manuscripts={manuscripts} />
        </div>
      </main>

      <footer className="border-t border-border bg-primary py-6 text-center text-xs text-primary-foreground/60">
        <p>© {new Date().getFullYear()} LOKAMARK — Pelestarian Naskah Kuno Bali</p>
      </footer>
    </div>
  )
}
