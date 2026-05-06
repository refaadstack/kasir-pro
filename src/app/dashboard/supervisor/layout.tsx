import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { Navbar } from '@/components/layout/Navbar'
import { SupervisorBottomNav } from '@/components/layout/SupervisorBottomNav'
import { SupervisorSidebar } from '@/components/layout/SupervisorSidebar'

export default async function SupervisorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session || !['SUPERVISOR', 'SUPERADMIN'].includes(session.role)) {
    redirect('/unauthorized')
  }

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {/* Sidebar for desktop */}
        <SupervisorSidebar />
        
        {/* Main content */}
        <main className="flex-1 pb-24 md:pb-8">
          {children}
        </main>
      </div>
      
      {/* Bottom nav for mobile */}
      <SupervisorBottomNav />
    </div>
  )
}
