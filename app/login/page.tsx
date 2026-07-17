import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/admin/login-form'
import { getSessionUser } from '@/lib/auth'

export const metadata = {
  title: 'Login — LOKAMARK',
}

export default async function LoginPage() {
  const user = await getSessionUser()
  if (user?.role === 'admin') redirect('/admin')
  if (user?.role === 'visitor') redirect('/visitor')

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <LoginForm />
    </div>
  )
}
