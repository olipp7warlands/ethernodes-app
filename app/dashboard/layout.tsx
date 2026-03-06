import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import DashboardShell from '@/components/DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check auth cookie
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value
  
  if (!token) {
    redirect('/login')
  }

  return <DashboardShell>{children}</DashboardShell>
}
