'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  FileText, 
  Settings,
  Tag,
  Clock,
  Activity,
  Receipt
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/dashboard/superadmin', icon: LayoutDashboard },
  { label: 'Produk', href: '/dashboard/superadmin/produk', icon: Package },
  { label: 'Kategori', href: '/dashboard/superadmin/kategori', icon: Tag },
  { label: 'Karyawan', href: '/dashboard/superadmin/karyawan', icon: Users },
  { label: 'Transaksi', href: '/dashboard/superadmin/transaksi', icon: Receipt },
  { label: 'Shift', href: '/dashboard/superadmin/shift', icon: Clock },
  { label: 'Laporan', href: '/dashboard/superadmin/laporan', icon: FileText },
  { label: 'Audit Log', href: '/dashboard/superadmin/log', icon: Activity },
  { label: 'Lainnya', href: '/dashboard/superadmin/more', icon: Settings },
]

export function SuperadminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-[rgba(13,13,20,0.97)] border-r border-white/10 h-[calc(100vh-52px)] sticky top-[52px]">
      <nav className="p-4 space-y-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href as any}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative',
                isActive
                  ? 'bg-amber-400/10 text-amber-400 font-semibold'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-400 rounded-r-full" />
              )}
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Version Info */}
      <div className="p-4">
        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="text-xs text-white/40 text-center">
            KasirPro v2.0
          </div>
          <div className="text-[10px] text-white/20 text-center mt-1">
            © 2026 All rights reserved
          </div>
        </div>
      </div>
    </aside>
  )
}
