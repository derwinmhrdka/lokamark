import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { VisitorRequestsClient } from '@/components/visitor/visitor-requests-client'

export default async function VisitorRequestsPage() {
  const user = await getSessionUser()
  if (!user || user.role !== 'visitor') redirect('/login')
  return <VisitorRequestsClient />
}
