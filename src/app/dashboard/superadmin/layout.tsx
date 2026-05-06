import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { Navbar } from '@/components/layout/Navbar'
import { SuperadminBottomNav } from '@/components/layout/SuperadminBottomNav'
import { SuperadminSidebar } from '@/components/layout/SuperadminSidebar'

export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session || session.role !== 'SUPERADMIN') {
    redirect('/unauthorized')
  }

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {/* Sidebar for desktop */}
        <SuperadminSidebar />
        
        {/* Main content */}
        <main className="flex-1 pb-24 md:pb-8">
          {children}
        </main>
      </div>
      
      {/* Bottom nav for mobile */}
      <SuperadminBottomNav />
    </div>
  )
}
