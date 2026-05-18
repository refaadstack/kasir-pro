'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ShoppingCart, 
  Clock, 
  Receipt,
  Package
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'POS', href: '/dashboard/kasir', icon: ShoppingCart },
  { label: 'Shift', href: '/dashboard/kasir/shift', icon: Clock },
  { label: 'Restock', href: '/dashboard/kasir/restock', icon: Package },
  { label: 'Riwayat', href: '/dashboard/kasir/riwayat', icon: Receipt },
]

export function KasirBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[rgba(13,13,20,0.97)] backdrop-blur-2xl border-t border-white/10 md:hidden z-50">
      <div className="flex items-stretch h-16 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href as any}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 transition-colors relative',
                isActive ? 'text-amber-400' : 'text-white/40'
              )}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-amber-400 rounded-b-full" />
              )}
              <Icon className={cn(
                'w-5 h-5 transition-transform',
                isActive && '-translate-y-0.5'
              )} />
              <span className="text-[9px] font-semibold tracking-wide">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
