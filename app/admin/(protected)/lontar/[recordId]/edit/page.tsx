import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getManuscriptByRecordId } from '@/lib/airtable'
import { EditLontarForm } from '@/components/admin/edit-lontar-form'

type PageProps = {
  params: Promise<{ recordId: string }>
}

export default async function EditLontarPage({ params }: PageProps) {
  const { recordId } = await params
  const record = await getManuscriptByRecordId(recordId)
  if (!record) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/lontar"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali
        </Link>
        <h1 className="font-serif text-2xl font-bold text-foreground">Edit Lontar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Perbarui data <span className="font-mono font-medium">{record.id}</span>
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <EditLontarForm recordId={recordId} initial={record} />
      </div>
    </div>
  )
}
