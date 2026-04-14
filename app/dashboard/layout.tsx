import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import DashboardShell from '@/components/DashboardShell'
import { WalletProvider } from '@/context/WalletContext'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) {
    redirect('/login')
  }

  return (
    <WalletProvider>
      <DashboardShell>{children}</DashboardShell>
    </WalletProvider>
  )
}
