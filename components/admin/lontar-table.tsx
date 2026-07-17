'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import type { ManuscriptRecord } from '@/lib/manuscripts'

type LontarTableProps = {
  records: ManuscriptRecord[]
}

export function LontarTable({ records }: LontarTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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
      const data = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(data.error || 'Gagal menonaktifkan')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menonaktifkan lontar')
    } finally {
      setDeletingId(null)
    }
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
            {records.map((record) => (
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
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium transition hover:border-gold hover:text-foreground"
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                      Edit
                    </Link>
                    <button
                      type="button"
                      disabled={deletingId === record.recordId || record.status === 'inactive'}
                      onClick={() => handleDelete(record)}
                      className="inline-flex items-center gap-1 rounded-lg border border-danger/30 px-2.5 py-1.5 text-xs font-medium text-danger transition hover:bg-danger/5 disabled:opacity-60"
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                      {deletingId === record.recordId
                        ? 'Menonaktifkan…'
                        : record.status === 'inactive'
                          ? 'Inactive'
                          : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
