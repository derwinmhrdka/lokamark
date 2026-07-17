import Link from 'next/link'
import { listAllManuscripts } from '@/lib/airtable'
import { LontarTable } from '@/components/admin/lontar-table'

export default async function LontarManagementPage() {
  let records: Awaited<ReturnType<typeof listAllManuscripts>> = []
  let error: string | null = null

  try {
    records = await listAllManuscripts()
  } catch (err) {
    error = err instanceof Error ? err.message : 'Gagal memuat data Airtable'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Lontar Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Kelola data lontar.</p>
        </div>
        <Link href="/admin/lontar/add" className="rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground">
          Add
        </Link>
      </div>
      {error ? <div className="rounded-xl border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger">{error}</div> : null}
      {!error && <LontarTable records={records} />}
    </div>
  )
}
