// Home page - redirects to dashboard

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  // Redirect based on role
  if (session.user.role === 'ADMIN') {
    redirect('/admin/dashboard')
  } else if (session.user.role === 'MANAGER') {
    redirect('/manager/dashboard')
  } else {
    redirect('/employee/dashboard')
  }
}
