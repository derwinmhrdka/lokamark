import { redirect } from 'next/navigation'
import { VisitorHeader } from '@/components/visitor/visitor-header'
import { getSessionUser } from '@/lib/auth'

export default async function VisitorLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getSessionUser()
  if (!user || user.role !== 'visitor') redirect('/login')

  return (
    <div className="min-h-screen bg-background">
      <VisitorHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}
