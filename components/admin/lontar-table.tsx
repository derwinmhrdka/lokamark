'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import type { ManuscriptRecord } from '@/lib/manuscripts'

export function LontarTable() {
  const router = useRouter()
  const [records, setRecords] = useState<ManuscriptRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/admin/lontar')
      .then(async (res) => {
        const data = (await res.json()) as { records?: ManuscriptRecord[]; error?: string }
        if (cancelled) return
        if (!res.ok) throw new Error(data.error || 'Gagal memuat lontar')
        setRecords(data.records ?? [])
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Gagal memuat lontar')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleDelete(record: ManuscriptRecord) {
    if (record.status === 'inactive') return

    const confirmed = window.confirm(
      `Nonaktifkan lontar "${record.name}" (${record.id})?`,
    )
    if (!confirmed) return

    setDeletingId(record.recordId)
    setError(null)

    try {
      const res = await fetch(`/api/admin/lontar?recordId=${encodeURIComponent(record.recordId)}`, {
        method: 'DELETE',
      })
      const data = (await res.json()) as { error?: string; record?: ManuscriptRecord }
      if (!res.ok) throw new Error(data.error || 'Gagal menonaktifkan')
      if (data.record) {
        setRecords((prev) =>
          prev.map((r) => (r.recordId === record.recordId ? data.record! : r)),
        )
      } else {
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menonaktifkan lontar')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground shadow-sm">
        Memuat data lontar…
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {error ? (
        <div className="border-b border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Institusi</th>
              <th className="px-4 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada data lontar.
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.recordId} className="border-b border-border/70 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{record.id}</td>
                  <td className="px-4 py-3 font-medium">{record.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        record.status === 'verified'
                          ? 'rounded-md bg-success/15 px-2 py-0.5 text-xs font-medium text-success'
                          : record.status === 'inactive'
                            ? 'rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground'
                            : 'rounded-md bg-gold/15 px-2 py-0.5 text-xs font-medium text-foreground'
                      }
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{record.category || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{record.institution || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/lontar/${record.recordId}/edit`}
                        prefetch
                        aria-label={`Edit ${record.name}`}
                        title="Edit"
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-border transition hover:border-gold hover:text-foreground"
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                      </Link>
                      <button
                        type="button"
                        disabled={deletingId === record.recordId || record.status === 'inactive'}
                        onClick={() => handleDelete(record)}
                        aria-label={
                          record.status === 'inactive'
                            ? `${record.name} sudah inactive`
                            : `Nonaktifkan ${record.name}`
                        }
                        title={record.status === 'inactive' ? 'Inactive' : 'Delete'}
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-danger/30 text-danger transition hover:bg-danger/5 disabled:opacity-60"
                      >
                        <Trash2
                          className={`size-3.5 ${deletingId === record.recordId ? 'animate-pulse' : ''}`}
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
