'use client'

import Link from 'next/link'
import { 
  Receipt, 
  Activity, 
  FileText,
  Users,
  LogOut,
  ChevronRight,
  Shield
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

export default function MorePage() {
  const { user, logout } = useAuth()

  const menuItems = [
    {
      icon: Receipt,
      label: 'Riwayat Transaksi',
      description: 'Semua transaksi',
      href: '/dashboard/manager/transaksi',
      color: 'amber',
    },
    {
      icon: FileText,
      label: 'Laporan Penjualan',
      description: 'Analisis performa',
      href: '/dashboard/manager/laporan',
      color: 'blue',
    },
    {
      icon: Users,
      label: 'Data Karyawan',
      description: 'Lihat karyawan',
      href: '/dashboard/manager/karyawan',
      color: 'green',
    },
    {
      icon: Activity,
      label: 'Activity Log',
      description: 'Log aktivitas sistem',
      href: '/dashboard/manager/log',
      color: 'purple',
    },
  ]

  const colorClasses: Record<string, string> = {
    amber: 'bg-amber-400/10 text-amber-400',
    blue: 'bg-blue-400/10 text-blue-400',
    green: 'bg-green-400/10 text-green-400',
    purple: 'bg-purple-400/10 text-purple-400',
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white">Lainnya</h1>
        <p className="text-sm text-white/40 mt-1">
          Menu dan informasi tambahan
        </p>
      </div>

      {/* User Info */}
      <Card className="bg-gradient-to-br from-purple-400/10 to-blue-500/10 border-purple-400/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-blue-500 rounded-xl flex items-center justify-center text-2xl font-black text-white">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white">{user?.name}</h3>
              <p className="text-sm text-white/60">{user?.email}</p>
              <div className="mt-1">
                <span className="inline-block px-2 py-0.5 bg-purple-400/20 border border-purple-400/30 rounded text-xs font-semibold text-purple-400">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Banner */}
      <Card className="bg-blue-400/10 border-blue-400/20">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-400 text-sm">Akses Manager</h3>
              <p className="text-xs text-blue-400/80 mt-1">
                Anda memiliki akses untuk melihat transaksi, laporan, karyawan, dan activity log. Untuk mengelola produk dan pengaturan, hubungi Superadmin.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Items */}
      <div className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href as any}>
              <Card className="bg-white/[0.04] border-white/10 hover:bg-white/[0.06] transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[item.color]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm">{item.label}</h3>
                      <p className="text-xs text-white/40">{item.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/20" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="w-full p-4 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 hover:border-red-400/30 rounded-xl transition-all"
      >
        <div className="flex items-center justify-center gap-2 text-red-400">
          <LogOut className="w-5 h-5" />
          <span className="font-bold">Logout</span>
        </div>
      </button>

      {/* Version */}
      <div className="text-center text-xs text-white/20 py-4">
        KasirPro v2.0 • Manager Dashboard
      </div>
    </div>
  )
}
