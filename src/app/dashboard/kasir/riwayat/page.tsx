'use client'

import { useState, useEffect } from 'react'
import { Search, Receipt, Calendar, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { TransactionDetailModal } from '@/components/pos/TransactionDetailModal'
import { useToast } from '@/hooks/use-toast'

type Transaction = {
  id: string
  trx_code: string
  total_amount: number
  subtotal_amount: number
  tax_amount: number
  service_charge_amount: number
  discount_amount: number
  discount_code: string | null
  edc_code: string | null
  payment_method: string
  cash_received: number
  change_amount: number
  status: string
  void_reason: string | null
  created_at: string
}

export default function RiwayatPage() {
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null)

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    let filtered = transactions

    if (search) {
      filtered = filtered.filter(t =>
        t.trx_code.toLowerCase().includes(search.toLowerCase())
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
      const res = await fetch('/api/transactions')
      if (res.ok) {
        const data = await res.json()
        setTransactions(data)
        setFilteredTransactions(data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat riwayat transaksi',
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

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = new Date(transaction.created_at).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(transaction)
    return groups
  }, {} as Record<string, Transaction[]>)

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white">Riwayat Transaksi</h1>
        <p className="text-sm text-white/40 mt-1">
          {filteredTransactions.length} transaksi
        </p>
      </div>

      {/* Search & Filter */}
      <Card className="bg-white/[0.04] border-white/10">
        <CardContent className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              type="text"
              placeholder="Cari kode transaksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>
          <div className="flex gap-2">
            {[
              { value: null, label: 'Semua' },
              { value: 'SUCCESS', label: 'Selesai' },
              { value: 'VOID', label: 'Void' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => setStatusFilter(item.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === item.value ? 'bg-amber-400 text-gray-900' : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            ))}
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
        <div className="space-y-4">
          {Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
            <div key={date} className="space-y-2">
              {/* Date Header */}
              <div className="flex items-center gap-2 px-2">
                <Calendar className="w-4 h-4 text-white/40" />
                <span className="text-sm font-semibold text-white/60">{date}</span>
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-white/40">
                  {dateTransactions.length} transaksi
                </span>
              </div>

              {/* Transactions */}
              {dateTransactions.map((transaction) => (
                <Card
                  key={transaction.id}
                  className={`cursor-pointer transition-all hover:scale-[1.01] ${
                    transaction.status === 'SUCCESS'
                      ? 'bg-white/[0.04] border-white/10 hover:border-green-400/30'
                      : 'bg-red-400/[0.03] border-red-400/20 hover:border-red-400/40'
                  }`}
                  onClick={() => setSelectedTransactionId(transaction.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Status Icon */}
                      {transaction.status === 'SUCCESS' ? (
                        <div className="w-10 h-10 bg-green-400/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-red-400/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <XCircle className="w-5 h-5 text-red-400" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-white text-sm mono">{transaction.trx_code}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            transaction.status === 'SUCCESS'
                              ? 'bg-green-400/20 text-green-400'
                              : 'bg-red-400/20 text-red-400'
                          }`}>
                            {transaction.status === 'SUCCESS' ? 'Selesai' : 'Void'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/60 flex-wrap">
                          <span>{transaction.payment_method}</span>
                          {transaction.edc_code && (
                            <span className="text-blue-400">EDC: {transaction.edc_code}</span>
                          )}
                          {transaction.discount_amount > 0 && (
                            <span className="text-green-400">Diskon: {formatCurrency(transaction.discount_amount)}</span>
                          )}
                        </div>
                        {transaction.void_reason && (
                          <p className="text-xs text-red-400/80 mt-1">Alasan: {transaction.void_reason}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-black text-amber-400 mono">
                            {formatCurrency(transaction.total_amount)}
                          </span>
                          <span className="text-xs text-white/40">
                            {new Date(transaction.created_at).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={!!selectedTransactionId}
        onClose={() => setSelectedTransactionId(null)}
        transactionId={selectedTransactionId}
      />
    </div>
  )
}
