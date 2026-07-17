import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { listPendingManuscripts } from '@/lib/airtable'
import { ApprovalList } from '@/components/admin/approval-list'

export default async function ApprovalPage() {
  let records: Awaited<ReturnType<typeof listPendingManuscripts>> = []
  let loadError: string | null = null

  try {
    records = await listPendingManuscripts()
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Gagal memuat data approval'
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali
        </Link>
        <h1 className="font-serif text-2xl font-bold text-foreground">Approval</h1>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger">
          {loadError}
        </div>
      ) : (
        <ApprovalList records={records} />
      )}
    </div>
  )
}
