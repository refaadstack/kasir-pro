'use client'

import { useState, useEffect } from 'react'
import { Search, Receipt, Eye, Printer } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useToast } from '@/hooks/use-toast'
import { ThermalReceipt } from '@/components/superadmin/ThermalReceipt'

type Transaction = {
  id: string
  code: string
  total: number
  payment_method: string
  amount_paid: number
  change: number
  status: string
  created_at: string
  kasir: {
    name: string
  }
  items: Array<{
    product_name: string
    qty: number
    price: number
    subtotal: number
  }>
}

type Settings = {
  store_name: string
  store_address: string
  store_phone: string
  receipt_footer: string
}

export default function TransaksiPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchTransactions()
    fetchSettings()
  }, [])

  useEffect(() => {
    let filtered = transactions

    if (search) {
      filtered = filtered.filter(t => 
        t.code.toLowerCase().includes(search.toLowerCase()) ||
        t.kasir.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (statusFilter) {
      filtered = filtered.filter(t => t.status === statusFilter)
    }

    setFilteredTransactions(filtered)
  }, [search, statusFilter, transactions])

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/transactions?limit=100')
      if (res.ok) {
        const data = await res.json()
        setTransactions(data)
        setFilteredTransactions(data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data transaksi',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const handleViewReceipt = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      TUNAI: 'Tunai',
      QRIS: 'QRIS',
      TRANSFER: 'Transfer',
    }
    return labels[method] || method
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white">Riwayat Transaksi</h1>
        <p className="text-sm text-white/40 mt-1">
          {filteredTransactions.length} transaksi
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-white/[0.04] border-white/10">
        <CardContent className="p-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              type="text"
              placeholder="Cari kode transaksi atau kasir..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setStatusFilter(null)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === null
                  ? 'bg-amber-400 text-gray-900'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === 'COMPLETED'
                  ? 'bg-amber-400 text-gray-900'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Selesai
            </button>
            <button
              onClick={() => setStatusFilter('VOIDED')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === 'VOIDED'
                  ? 'bg-amber-400 text-gray-900'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Dibatalkan
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      {isLoading ? (
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-8">
            <LoadingSpinner size="lg" />
          </CardContent>
        </Card>
      ) : filteredTransactions.length === 0 ? (
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-8">
            <EmptyState
              icon={Receipt}
              title="Tidak ada transaksi"
              description="Belum ada transaksi yang tercatat"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="bg-white/[0.04] border-white/10 hover:bg-white/[0.06] transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-amber-400/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Receipt className="w-6 h-6 text-amber-400" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white text-sm mono">{transaction.code}</h3>
                      <StatusBadge status={transaction.status === 'COMPLETED' ? 'success' : 'error'}>
                        {transaction.status === 'COMPLETED' ? 'Selesai' : 'Dibatalkan'}
                      </StatusBadge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span>{transaction.kasir.name}</span>
                      <span>•</span>
                      <span>{getPaymentMethodLabel(transaction.payment_method)}</span>
                      <span>•</span>
                      <span>{new Date(transaction.created_at).toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-amber-400 mono text-sm">
                      {formatCurrency(transaction.total)}
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => handleViewReceipt(transaction)}
                    className="p-2 bg-white/5 hover:bg-amber-400/10 border border-white/10 hover:border-amber-400/30 rounded-lg transition-all flex-shrink-0"
                  >
                    <Printer className="w-4 h-4 text-amber-400" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Receipt Modal */}
      {selectedTransaction && settings && (
        <ThermalReceipt
          transaction={selectedTransaction}
          settings={settings}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  )
}
