'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, DollarSign, ShoppingCart, Package, Download, CreditCard, Smartphone, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type ReportStats = {
  totalSales: number
  totalTransactions: number
  avgTransaction: number
  topProducts: Array<{ name: string; sold: number; revenue: number }>
}

type Transaction = {
  id: string
  trx_code: string
  total_amount: number
  payment_method: string
  status: string
  created_at: string
  user_id: string
}

export default function LaporanPage() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today')
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [reportRes, trxRes] = await Promise.all([
        fetch(`/api/reports?period=${period}`),
        fetch('/api/transactions?limit=500'),
      ])
      if (reportRes.ok) setStats(await reportRes.json())
      if (trxRes.ok) setTransactions(await trxRes.json())
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)

  // Filter transactions by period
  const getFilteredTransactions = () => {
    const now = new Date()
    const start = new Date()
    if (period === 'today') start.setHours(0, 0, 0, 0)
    else if (period === 'week') { start.setDate(now.getDate() - 7); start.setHours(0, 0, 0, 0) }
    else { start.setDate(now.getDate() - 30); start.setHours(0, 0, 0, 0) }

    return transactions.filter(t => t.status === 'SUCCESS' && new Date(t.created_at) >= start)
  }

  // Payment method breakdown
  const getPaymentBreakdown = () => {
    const filtered = getFilteredTransactions()
    const breakdown = { TUNAI: 0, QRIS: 0, TRANSFER: 0 }
    filtered.forEach(t => {
      if (t.payment_method in breakdown) {
        breakdown[t.payment_method as keyof typeof breakdown] += t.total_amount
      }
    })
    return breakdown
  }

  // Export CSV
  const handleExport = () => {
    const filtered = getFilteredTransactions()
    const headers = ['Kode', 'Tanggal', 'Total', 'Metode Bayar', 'Status']
    const rows = filtered.map(t => [
      t.trx_code,
      new Date(t.created_at).toLocaleString('id-ID'),
      t.total_amount.toString(),
      t.payment_method,
      t.status,
    ])

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `laporan-${period}-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-8"><LoadingSpinner size="lg" /></CardContent>
        </Card>
      </div>
    )
  }

  const payment = getPaymentBreakdown()
  const filteredTrx = getFilteredTransactions()

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Laporan Penjualan</h1>
          <p className="text-sm text-white/40 mt-1">Analisis performa bisnis</p>
        </div>
        <Button onClick={handleExport} className="bg-green-400 hover:bg-green-500 text-gray-900 font-bold">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {[
          { value: 'today', label: 'Hari Ini' },
          { value: 'week', label: '7 Hari' },
          { value: 'month', label: '30 Hari' },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => setPeriod(item.value as 'today' | 'week' | 'month')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
              period === item.value ? 'bg-amber-400 text-gray-900' : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-4">
            <div className="p-2 bg-amber-400/10 rounded-lg w-fit mb-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xs text-white/40 font-semibold">Total Penjualan</p>
            <p className="text-lg font-black text-amber-400 mono">{formatCurrency(stats?.totalSales || 0)}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-4">
            <div className="p-2 bg-blue-400/10 rounded-lg w-fit mb-2">
              <ShoppingCart className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xs text-white/40 font-semibold">Transaksi</p>
            <p className="text-lg font-black text-white mono">{stats?.totalTransactions || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-4">
            <div className="p-2 bg-green-400/10 rounded-lg w-fit mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-xs text-white/40 font-semibold">Rata-rata</p>
            <p className="text-lg font-black text-white mono">{formatCurrency(stats?.avgTransaction || 0)}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-4">
            <div className="p-2 bg-purple-400/10 rounded-lg w-fit mb-2">
              <Package className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-xs text-white/40 font-semibold">Produk Terlaris</p>
            <p className="text-sm font-bold text-white truncate">{stats?.topProducts[0]?.name || '-'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Breakdown */}
      <Card className="bg-white/[0.04] border-white/10">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-white">Metode Pembayaran</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-green-400" />
              <span className="text-sm text-white">Tunai</span>
            </div>
            <span className="font-bold text-white mono">{formatCurrency(payment.TUNAI)}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white">QRIS</span>
            </div>
            <span className="font-bold text-white mono">{formatCurrency(payment.QRIS)}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-white">Transfer</span>
            </div>
            <span className="font-bold text-white mono">{formatCurrency(payment.TRANSFER)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Top Products Chart */}
      <Card className="bg-white/[0.04] border-white/10">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-white">Produk Terlaris (Revenue)</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.topProducts && stats.topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.topProducts.slice(0, 7).map(p => ({ name: p.name.length > 10 ? p.name.slice(0, 10) + '..' : p.name, revenue: p.revenue }))}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#ffffff60', fontSize: 10 }} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #ffffff20', borderRadius: 8 }} labelStyle={{ color: '#fff' }} />
                <Bar dataKey="revenue" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-white/40 text-sm text-center py-8">Belum ada data</p>
          )}
        </CardContent>
      </Card>

      {/* Top Products Table */}
      <Card className="bg-white/[0.04] border-white/10">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-white">Detail Produk Terlaris</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {stats?.topProducts && stats.topProducts.length > 0 ? (
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
                <span className="text-sm font-bold text-amber-400 mono">{formatCurrency(product.revenue)}</span>
              </div>
            ))
          ) : (
            <p className="text-white/40 text-sm text-center py-4">Belum ada data</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="bg-white/[0.04] border-white/10">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-white">Transaksi Terbaru ({filteredTrx.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-80 overflow-y-auto">
          {filteredTrx.slice(0, 20).map((trx) => (
            <div key={trx.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <div className="text-sm font-semibold text-white mono">{trx.trx_code}</div>
                <div className="text-xs text-white/40">
                  {trx.payment_method} • {new Date(trx.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <span className="text-sm font-bold text-amber-400 mono">{formatCurrency(trx.total_amount)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
