import Sidebar from '@/components/layout/Sidebar'
import LiveTicker from '@/components/layout/LiveTicker'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  if (!session) {
    redirect('/login')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <LiveTicker />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar user={session.user} />
        <main className="page-fade" style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px',
          background: 'var(--bg-base)',
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}
