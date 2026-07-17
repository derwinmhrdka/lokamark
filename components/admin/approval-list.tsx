'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { LontarQrCard } from '@/components/lontar-qr-card'
import type { ManuscriptRecord } from '@/lib/manuscripts'

type ApprovalListProps = {
  records: ManuscriptRecord[]
}

export function ApprovalList({ records: initialRecords }: ApprovalListProps) {
  const router = useRouter()
  const [records, setRecords] = useState(initialRecords)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [approved, setApproved] = useState<ManuscriptRecord | null>(null)

  async function handleApprove(record: ManuscriptRecord) {
    setApprovingId(record.recordId)
    setError(null)
    try {
      const res = await fetch('/api/admin/approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId: record.recordId }),
      })
      const data = (await res.json()) as { record?: ManuscriptRecord; error?: string }
      if (!res.ok || !data.record) throw new Error(data.error || 'Gagal menyetujui')
      setApproved(data.record)
      setRecords((prev) => prev.filter((r) => r.recordId !== record.recordId))
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyetujui lontar')
    } finally {
      setApprovingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      {approved ? (
        <div className="rounded-2xl border border-success/30 bg-success/5 p-5">
          <div className="mb-4 flex items-center gap-2 text-success">
            <CheckCircle2 className="size-5" aria-hidden="true" />
            <p className="text-sm font-semibold">
              Disetujui — QR code siap digunakan untuk scan di beranda
            </p>
          </div>
          <LontarQrCard id={approved.id} name={approved.name} qrUrl={approved.qrUrl} />
          <button
            type="button"
            onClick={() => setApproved(null)}
            className="mt-3 text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Tutup
          </button>
        </div>
      ) : null}

      {records.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card/50 px-5 py-10 text-center text-sm text-muted-foreground">
          Tidak ada pengajuan yang menunggu approval.
        </p>
      ) : (
        <ul className="space-y-3">
          {records.map((record) => (
            <li
              key={record.recordId}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-mono text-xs font-semibold text-gold">{record.id}</p>
                <p className="mt-0.5 font-serif text-lg font-bold text-foreground">{record.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {record.category || '—'}
                  {record.createdBy ? ` · oleh ${record.createdBy}` : ''}
                </p>
              </div>
              <button
                type="button"
                disabled={approvingId === record.recordId}
                onClick={() => handleApprove(record)}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-gold-foreground transition hover:brightness-95 disabled:opacity-60"
              >
                <CheckCircle2 className="size-4" aria-hidden="true" />
                {approvingId === record.recordId ? 'Menyetujui…' : 'Approve'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
