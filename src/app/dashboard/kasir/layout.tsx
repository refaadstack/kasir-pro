import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { Navbar } from '@/components/layout/Navbar'
import { KasirSidebar } from '@/components/layout/KasirSidebar'
import { KasirBottomNav } from '@/components/layout/KasirBottomNav'

export default async function KasirLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session || !['KASIR', 'SUPERVISOR', 'MANAGER', 'SUPERADMIN'].includes(session.role)) {
    redirect('/unauthorized')
  }

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {/* Sidebar for desktop */}
        <KasirSidebar />
        
        {/* Main content */}
        <main className="flex-1 pb-24 md:pb-8">
          {children}
        </main>
      </div>
      
      {/* Bottom nav for mobile */}
      <KasirBottomNav />
    </div>
  )
}
