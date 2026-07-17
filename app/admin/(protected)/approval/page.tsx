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
