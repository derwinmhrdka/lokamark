'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LontarQrCard } from '@/components/lontar-qr-card'
import type { ManuscriptRecord } from '@/lib/manuscripts'

export function VisitorRequestsClient() {
  const [records, setRecords] = useState<ManuscriptRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/visitor/lontar')
      .then(async (res) => {
        const data = (await res.json()) as { records?: ManuscriptRecord[]; error?: string }
        if (cancelled) return
        if (!res.ok) throw new Error(data.error || 'Gagal memuat request')
        setRecords(data.records ?? [])
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Gagal memuat request')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

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
          <h1 className="font-serif text-2xl font-bold text-foreground">Your Request</h1>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Memuat…</p>
        ) : error ? (
          <div className="rounded-xl border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : records.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card/50 px-5 py-10 text-center text-sm text-muted-foreground">
            Belum ada pengajuan. Daftarkan lontar terlebih dahulu.
          </p>
        ) : (
          <ul className="space-y-4">
            {records.map((record) => (
              <li
                key={record.recordId}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="border-b border-border/70 px-4 py-4 sm:px-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs font-semibold text-gold">{record.id}</p>
                      <p className="mt-0.5 font-serif text-lg font-bold text-foreground">
                        {record.name}
                      </p>
                    </div>
                    <StatusBadge status={record.status} />
                  </div>
                  {record.category ? (
                    <p className="mt-2 text-sm text-muted-foreground">{record.category}</p>
                  ) : null}
                </div>

                {record.status === 'verified' ? (
                  <div className="p-4 sm:p-5">
                    <LontarQrCard id={record.id} name={record.name} qrUrl={record.qrUrl} />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: ManuscriptRecord['status'] }) {
  const styles =
    status === 'verified'
      ? 'bg-success/15 text-success'
      : status === 'inactive'
        ? 'bg-muted text-muted-foreground'
        : 'bg-gold/15 text-foreground'

  return (
    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${styles}`}>{status}</span>
  )
}
