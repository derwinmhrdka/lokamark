import Link from 'next/link'

export default function AdminMenuPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Admin Menu</h1>
        <p className="mt-1 text-sm text-muted-foreground">Pilih fitur pengelolaan.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/admin/approval" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="font-semibold">Approval</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Setujui pengajuan visitor — generate QR setelah approved
          </p>
        </Link>
        <Link href="/admin/lontar" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="font-semibold">Lontar Management</p>
          <p className="mt-1 text-sm text-muted-foreground">Tambah, edit, hapus data lontar</p>
        </Link>
        <Link href="/admin/users" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="font-semibold">User Management</p>
          <p className="mt-1 text-sm text-muted-foreground">Kelola user (placeholder)</p>
        </Link>
      </div>
    </div>
  )
}
