import { redirect } from 'next/navigation'
import { RegisterForm } from '@/components/register-form'
import { getSessionUser } from '@/lib/auth'

export const metadata = {
  title: 'Daftar — LOKAMARK',
}

export default async function RegisterPage() {
  const user = await getSessionUser()
  if (user?.role === 'admin') redirect('/admin')
  if (user?.role === 'visitor') redirect('/visitor')

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <RegisterForm />
    </div>
  )
}
