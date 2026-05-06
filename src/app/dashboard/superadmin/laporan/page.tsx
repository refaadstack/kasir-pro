'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Package,
  Calendar,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

type ReportStats = {
  totalSales: number
  totalTransactions: number
  avgTransaction: number
  topProducts: Array<{
    name: string
    sold: number
    revenue: number
  }>
}

export default function LaporanPage() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today')
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchReportData()
  }, [period])

  const fetchReportData = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/reports?period=${period}`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching report:', error)
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
            <p className="text-white/60 text-center">Gagal memuat data laporan</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Laporan Penjualan</h1>
          <p className="text-sm text-white/40 mt-1">
            Analisis performa bisnis Anda
          </p>
        </div>
        <Button className="bg-green-400 hover:bg-green-500 text-gray-900 font-bold">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Period Selector */}
      <Card className="bg-white/[0.04] border-white/10">
        <CardContent className="p-4">
          <div className="flex gap-2">
            {[
              { value: 'today', label: 'Hari Ini' },
              { value: 'week', label: '7 Hari' },
              { value: 'month', label: '30 Hari' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setPeriod(item.value as any)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                  period === item.value
                    ? 'bg-amber-400 text-gray-900'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-amber-400/10 rounded-lg">
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-xs text-white/40 font-semibold">Total Penjualan</span>
            </div>
            <p className="text-lg font-black text-amber-400 mono">
              {formatCurrency(stats.totalSales)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-blue-400/10 rounded-lg">
                <ShoppingCart className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-xs text-white/40 font-semibold">Transaksi</span>
            </div>
            <p className="text-lg font-black text-white mono">
              {stats.totalTransactions}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-green-400/10 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-xs text-white/40 font-semibold">Rata-rata</span>
            </div>
            <p className="text-lg font-black text-white mono">
              {formatCurrency(stats.avgTransaction)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-purple-400/10 rounded-lg">
                <Package className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-xs text-white/40 font-semibold">Terlaris</span>
            </div>
            <p className="text-sm font-bold text-white truncate">
              {stats.topProducts[0]?.name || '-'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="bg-white/[0.04] border-white/10">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-white">Grafik Penjualan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-40">
            {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end">
                <div className="text-center mb-1">
                  <span className="text-[10px] text-white/60 font-semibold">
                    {Math.floor(Math.random() * 500) + 100}k
                  </span>
                </div>
                <div 
                  className="bg-gradient-to-t from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 rounded-t transition-all cursor-pointer"
                  style={{ height: `${height}%` }}
                />
                <div className="text-[9px] text-white/30 text-center mt-1">
                  {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'][i]}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card className="bg-white/[0.04] border-white/10">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-white">Produk Terlaris</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {stats.topProducts.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-4">Belum ada data penjualan</p>
          ) : (
            stats.topProducts.map((product, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-400/10 rounded-lg flex items-center justify-center text-xs font-black text-amber-400">
                    #{i + 1}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{product.name}</div>
                    <div className="text-xs text-white/40">{product.sold} terjual</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-amber-400 mono">
                    {formatCurrency(product.revenue)}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
