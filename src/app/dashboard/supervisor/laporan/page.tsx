'use client'

import { useState, useEffect } from 'react'
import { FileText, TrendingUp, ShoppingCart, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/hooks/use-toast'

type ReportData = {
  totalSales: number
  totalTransactions: number
  avgTransaction: number
  topProducts: {
    name: string
    sold: number
    revenue: number
  }[]
}

type Period = 'today' | 'week' | 'month'

export default function LaporanPage() {
  const [period, setPeriod] = useState<Period>('today')
  const [report, setReport] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchReport()
  }, [period])

  const fetchReport = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/reports?period=${period}`)
      if (res.ok) {
        const data = await res.json()
        setReport(data)
      }
    } catch (error) {
      console.error('Error fetching report:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat laporan',
        variant: 'destructive',
      })
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

  const periodLabels: Record<Period, string> = {
    today: 'Hari Ini',
    week: '7 Hari Terakhir',
    month: '30 Hari Terakhir',
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-black text-white">Laporan Penjualan</h1>
        <p className="text-sm text-white/40 mt-1">Analisis performa penjualan</p>
      </div>

      <Card className="bg-white/[0.04] border-white/10">
        <CardContent className="p-4">
          <div className="flex gap-2">
            {(['today', 'week', 'month'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  period === p
                    ? 'bg-amber-400 text-gray-900'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-8">
            <LoadingSpinner size="lg" />
          </CardContent>
        </Card>
      ) : !report ? (
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-8">
            <EmptyState
              icon={FileText}
              title="Gagal memuat laporan"
              description="Terjadi kesalahan saat memuat data"
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="bg-white/[0.04] border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-400/10 rounded-xl">
                    <DollarSign className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">
                      Total Penjualan
                    </p>
                    <p className="text-xl font-black text-amber-400 mono mt-1">
                      {formatCurrency(report.totalSales)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.04] border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-400/10 rounded-xl">
                    <ShoppingCart className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">
                      Total Transaksi
                    </p>
                    <p className="text-xl font-black text-white mono mt-1">
                      {report.totalTransactions}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.04] border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-400/10 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">
                      Rata-rata
                    </p>
                    <p className="text-xl font-black text-white mono mt-1">
                      {formatCurrency(report.avgTransaction)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/[0.04] border-white/10">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-white">
                Top 10 Produk Terlaris
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.topProducts.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="Belum ada data"
                  description="Belum ada produk terjual pada periode ini"
                />
              ) : (
                <div className="space-y-2">
                  {report.topProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
                    >
                      <div className="w-8 h-8 bg-amber-400/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-black text-amber-400">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm truncate">
                          {product.name}
                        </h3>
                        <p className="text-xs text-white/40">
                          {product.sold} terjual
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-amber-400 mono">
                          {formatCurrency(product.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
