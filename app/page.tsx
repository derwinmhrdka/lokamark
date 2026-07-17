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
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-foreground">
            <Sparkles className="size-3.5 text-gold" aria-hidden="true" />
            Autentikasi Warisan Budaya
          </span>
          <h1 className="mt-4 font-serif text-3xl font-bold leading-tight text-foreground text-balance sm:text-4xl">
            Verifikasi Keaslian Naskah Kuno Bali
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base text-pretty">
            Pastikan keaslian lontar dan manuskrip warisan Bali. Pindai QR Code pada naskah atau
            masukkan ID Naskah secara manual untuk memverifikasinya.
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
