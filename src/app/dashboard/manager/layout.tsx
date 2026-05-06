import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { Navbar } from '@/components/layout/Navbar'
import { ManagerBottomNav } from '@/components/layout/ManagerBottomNav'
import { ManagerSidebar } from '@/components/layout/ManagerSidebar'

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session || !['MANAGER', 'SUPERADMIN'].includes(session.role)) {
    redirect('/unauthorized')
  }

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {/* Sidebar for desktop */}
        <ManagerSidebar />
        
        {/* Main content */}
        <main className="flex-1 pb-24 md:pb-8">
          {children}
        </main>
      </div>
      
      {/* Bottom nav for mobile */}
      <ManagerBottomNav />
    </div>
  )
}
