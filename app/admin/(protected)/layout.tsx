import { redirect } from 'next/navigation'
import { AdminHeader } from '@/components/admin/admin-header'
import { getSessionUser } from '@/lib/auth'

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getSessionUser()
  if (!user || user.role !== 'admin') redirect('/login')

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}
