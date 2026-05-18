'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ShoppingCart, 
  Clock, 
  Receipt
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'POS', href: '/dashboard/kasir', icon: ShoppingCart },
  { label: 'Shift', href: '/dashboard/kasir/shift', icon: Clock },
  { label: 'Riwayat', href: '/dashboard/kasir/riwayat', icon: Receipt },
]

export function KasirSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-[rgba(13,13,20,0.97)] border-r border-white/10 h-[calc(100vh-52px)] sticky top-[52px]">
      <nav className="p-4 space-y-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

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
    </aside>
  )
}
