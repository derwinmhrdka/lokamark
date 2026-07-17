'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import type { UserLogin } from '@/lib/airtable-users'

type UsersTableProps = {
  users: UserLogin[]
  currentUsername: string
}

export function UsersTable({ users, currentUsername }: UsersTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete(user: UserLogin) {
    if (user.username.toLowerCase() === currentUsername.toLowerCase()) return

    const confirmed = window.confirm(`Hapus user "${user.username}"?`)
    if (!confirmed) return

    setDeletingId(user.recordId)
    setError(null)

    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(user.recordId)}`, {
        method: 'DELETE',
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus user')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus user')
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
              <th className="px-4 py-3 font-medium">Username</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Dibuat</th>
              <th className="px-4 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada user.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isSelf = user.username.toLowerCase() === currentUsername.toLowerCase()
                return (
                  <tr key={user.recordId} className="border-b border-border/70 last:border-0">
                    <td className="px-4 py-3 font-medium">
                      {user.username}
                      {isSelf ? (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">(Anda)</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          user.role === 'admin'
                            ? 'rounded-md bg-gold/15 px-2 py-0.5 text-xs font-medium text-foreground'
                            : 'rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground'
                        }
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {user.createdDate
                        ? new Date(user.createdDate).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/users/${user.recordId}/edit`}
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium transition hover:border-gold hover:text-foreground"
                        >
                          <Pencil className="size-3.5" aria-hidden="true" />
                          Edit
                        </Link>
                        <button
                          type="button"
                          disabled={deletingId === user.recordId || isSelf}
                          onClick={() => handleDelete(user)}
                          className="inline-flex items-center gap-1 rounded-lg border border-danger/30 px-2.5 py-1.5 text-xs font-medium text-danger transition hover:bg-danger/5 disabled:opacity-60"
                        >
                          <Trash2 className="size-3.5" aria-hidden="true" />
                          {deletingId === user.recordId ? 'Menghapus…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
