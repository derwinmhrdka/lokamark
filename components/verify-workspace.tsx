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
  const [sampleIds, setSampleIds] = useState<string[]>([])
  const [samplesError, setSamplesError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/samples')
      .then(async (res) => {
        const data = (await res.json()) as { ids?: string[]; error?: string }
        if (cancelled) return
        if (!res.ok) {
          setSamplesError(data.error || 'Gagal memuat data Airtable')
          return
        }
        setSampleIds(data.ids ?? [])
      })
      .catch(() => {
        if (!cancelled) setSamplesError('Tidak dapat terhubung ke server')
      })
    return () => {
      cancelled = true
    }
  }, [])

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
          <Scanner onScan={handleVerify} sampleIds={sampleIds} />
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <ManualInput onSubmit={handleVerify} />
          <div className="mt-4 border-t border-border pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Contoh ID untuk dicoba
            </p>
            {samplesError ? (
              <p className="text-xs text-danger">{samplesError}</p>
            ) : sampleIds.length === 0 ? (
              <p className="text-xs text-muted-foreground">Memuat ID dari Airtable…</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sampleIds.map((sampleId) => (
                  <button
                    key={sampleId}
                    type="button"
                    disabled={loading}
                    onClick={() => handleVerify(sampleId)}
                    className="rounded-lg border border-border bg-secondary px-2.5 py-1 font-mono text-xs text-secondary-foreground transition hover:border-gold hover:text-foreground disabled:opacity-60"
                  >
                    {sampleId}
                  </button>
                ))}
              </div>
            )}
          </div>
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
              Hasil verifikasi akan ditampilkan di sini setelah Anda memindai QR Code atau
              memasukkan ID Naskah.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
