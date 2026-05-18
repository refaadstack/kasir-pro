'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { StatsCard } from '@/components/ui/StatsCard'
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileText,
  Receipt
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type DashboardStats = {
  todaySales: number
  todayTransactions: number
  todayTax: number
  todayServiceCharge: number
  activeProducts: number
  lowStockProducts: number
  activeShifts: number
  totalEmployees: number
  salesGrowth: number
  weeklyChart: {
    labels: string[]
    data: number[]
    percentages: number[]
  }
  weekTotal: number
}

export default function SuperadminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/dashboard/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-8">
            <LoadingSpinner size="lg" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="p-4">
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-8">
            <p className="text-white/60 text-center">Gagal memuat data dashboard</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-black text-white">Selamat datang 👋</h1>
        <p className="text-sm text-white/40 mt-1">
          {new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-amber-400/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">
                Penjualan Hari Ini
              </p>
              <p className="text-xl font-black text-amber-400 mono">
                {formatCurrency(stats.todaySales).replace('Rp', 'Rp ')}
              </p>
              <div className={`flex items-center gap-1 text-xs ${stats.salesGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.salesGrowth >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{Math.abs(stats.salesGrowth)}% vs kemarin</span>
              </div>
            </div>
            <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-400 rounded-full transition-all" 
                style={{ width: `${Math.min(stats.salesGrowth + 50, 100)}%` }} 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-400/10 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">
                Transaksi
              </p>
              <p className="text-xl font-black text-white mono">
                {stats.todayTransactions}
              </p>
              <p className="text-xs text-white/40">hari ini</p>
            </div>
            <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-blue-400 rounded-full" style={{ width: '50%' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-400/10 rounded-lg">
                <Package className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">
                Produk Aktif
              </p>
              <p className="text-xl font-black text-white mono">
                {stats.activeProducts}
              </p>
              {stats.lowStockProducts > 0 && (
                <div className="flex items-center gap-1 text-xs text-red-400">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{stats.lowStockProducts} stok rendah</span>
                </div>
              )}
            </div>
            <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full" style={{ width: '85%' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-400/10 rounded-lg">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">
                Shift Aktif
              </p>
              <p className="text-xl font-black text-white mono">
                {stats.activeShifts}
              </p>
              <p className="text-xs text-white/40">dari {stats.totalEmployees} karyawan</p>
            </div>
            <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-400 rounded-full" 
                style={{ width: `${stats.totalEmployees > 0 ? (stats.activeShifts / stats.totalEmployees) * 100 : 0}%` }} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tax & Service Charge Summary */}
      {(stats.todayTax > 0 || stats.todayServiceCharge > 0) && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white/[0.04] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-400/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">
                    Pajak Hari Ini
                  </p>
                  <p className="text-lg font-black text-orange-400 mono mt-0.5">
                    {formatCurrency(stats.todayTax)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.04] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-400/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">
                    Service Charge
                  </p>
                  <p className="text-lg font-black text-cyan-400 mono mt-0.5">
                    {formatCurrency(stats.todayServiceCharge)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart */}
      <Card className="bg-white/[0.04] border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-white">7 Hari Terakhir</CardTitle>
            <span className="text-xs text-white/40">{formatCurrency(stats.weekTotal)}</span>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.weeklyChart.labels.map((label, i) => ({ name: label, sales: stats.weeklyChart.data[i] }))}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#ffffff60', fontSize: 11 }} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ background: '#1a1a2e', border: '1px solid #ffffff20', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="sales" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-white/[0.04] border-white/10">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-white">Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/dashboard/superadmin/produk">
              <button className="w-full p-3 bg-white/5 hover:bg-amber-400/10 border border-white/10 hover:border-amber-400/30 rounded-xl transition-all text-left">
                <Package className="w-5 h-5 text-amber-400 mb-2" />
                <div className="text-xs font-semibold text-white">Tambah Produk</div>
                <div className="text-[10px] text-white/40">Produk baru</div>
              </button>
            </Link>
            <Link href="/dashboard/superadmin/karyawan">
              <button className="w-full p-3 bg-white/5 hover:bg-blue-400/10 border border-white/10 hover:border-blue-400/30 rounded-xl transition-all text-left">
                <Users className="w-5 h-5 text-blue-400 mb-2" />
                <div className="text-xs font-semibold text-white">Kelola Karyawan</div>
                <div className="text-[10px] text-white/40">User management</div>
              </button>
            </Link>
            <Link href="/dashboard/superadmin/laporan">
              <button className="w-full p-3 bg-white/5 hover:bg-green-400/10 border border-white/10 hover:border-green-400/30 rounded-xl transition-all text-left">
                <FileText className="w-5 h-5 text-green-400 mb-2" />
                <div className="text-xs font-semibold text-white">Lihat Laporan</div>
                <div className="text-[10px] text-white/40">Analisis penjualan</div>
              </button>
            </Link>
            <Link href="/dashboard/superadmin/pengaturan">
              <button className="w-full p-3 bg-white/5 hover:bg-purple-400/10 border border-white/10 hover:border-purple-400/30 rounded-xl transition-all text-left">
                <Receipt className="w-5 h-5 text-purple-400 mb-2" />
                <div className="text-xs font-semibold text-white">Pengaturan</div>
                <div className="text-[10px] text-white/40">Settings & more</div>
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
