'use client'

import { startTransition, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Loader2, ScrollText } from 'lucide-react'
import { Scanner } from '@/components/scanner'
import { ManualInput } from '@/components/manual-input'
import type { ScanResult } from '@/components/result-card'
import type { Manuscript } from '@/lib/manuscripts'

const ResultCard = dynamic(
  () => import('@/components/result-card').then((m) => m.ResultCard),
  {
    loading: () => (
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-border bg-card/50 p-8">
        <p className="text-sm text-muted-foreground">Memuat hasil…</p>
      </div>
    ),
  },
)

type VerifyResponse =
  | { status: 'verified'; manuscript: Manuscript; source?: string }
  | { status: 'invalid'; id: string; source?: string }
  | { error: string }

export function VerifyWorkspace() {
  const [result, setResult] = useState<ScanResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleVerify(id: string) {
    const trimmed = id.trim()
    if (!trimmed || loading) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/verify?id=${encodeURIComponent(trimmed)}`)
      const data = (await res.json()) as VerifyResponse

      if (!res.ok || 'error' in data) {
        setError('error' in data ? data.error : 'Verifikasi gagal')
        return
      }

      startTransition(() => {
        if (data.status === 'verified') {
          setResult({ status: 'verified', manuscript: data.manuscript })
        } else {
          setResult({ status: 'invalid', id: data.id })
        }
      })

      requestAnimationFrame(() => {
        document.getElementById('hasil')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    } catch {
      setError('Tidak dapat terhubung ke server verifikasi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('id')?.trim()
    if (id) void handleVerify(id)
    // Deep link from approval email (?id=LKM-...)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <div className="flex flex-col gap-6">
        <section
          aria-labelledby="scanner-title"
          className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6"
        >
          <h2
            id="scanner-title"
            className="mb-4 flex items-center gap-2 font-serif text-lg font-bold text-foreground"
          >
            <ScrollText className="size-5 text-gold" aria-hidden="true" />
            Pindai Naskah
          </h2>
          <Scanner onScan={handleVerify} />
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <ManualInput onSubmit={handleVerify} />
        </section>
      </div>

      <section id="hasil" aria-live="polite" aria-atomic="true" className="scroll-mt-20">
        <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold text-foreground">
          Hasil Pemindaian
          {loading ? (
            <Loader2 className="size-4 animate-spin text-gold" aria-label="Memverifikasi" />
          ) : null}
        </h2>
        {error ? (
          <div className="rounded-2xl border border-danger/40 bg-danger/5 px-5 py-4 text-sm text-danger">
            {error}
          </div>
        ) : null}
        {result ? (
          <ResultCard result={result} />
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card/50 p-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <ScrollText className="size-6" aria-hidden="true" />
            </span>
            <p className="text-sm text-muted-foreground text-pretty">
              Hasil verifikasi akan ditampilkan di sini.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
