'use client'

import { useState, useEffect } from 'react'
import { Search, Receipt, Eye, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ThermalReceipt } from '@/components/superadmin/ThermalReceipt'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

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
  items: {
    product_name: string
    qty: number
    price: number
    subtotal: number
  }[]
}

type Settings = {
  store_name: string
  store_address: string
  store_phone: string
  receipt_footer: string
}

export default function RiwayatPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    fetchTransactions()
    fetchSettings()
  }, [])

  useEffect(() => {
    let filtered = transactions

    if (search) {
      filtered = filtered.filter(t => 
        t.code.toLowerCase().includes(search.toLowerCase())
      )
    }

    setFilteredTransactions(filtered)
  }, [search, transactions])

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/transactions')
      if (res.ok) {
        const data = await res.json()
        // Filter only transactions by current kasir
        const myTransactions = data.filter((t: Transaction) => 
          t.kasir.name === user?.name
        )
        setTransactions(myTransactions)
        setFilteredTransactions(myTransactions)
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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
          {filteredTransactions.length} transaksi Anda
        </p>
      </div>

      {/* Search */}
      <Card className="bg-white/[0.04] border-white/10">
        <CardContent className="p-4">
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
                <Card key={transaction.id} className="bg-white/[0.04] border-white/10 hover:bg-white/[0.06] transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                        <Receipt className="w-5 h-5 text-amber-400" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-white text-sm mono">{transaction.code}</span>
                          <span className="text-white/40">•</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            transaction.status === 'COMPLETED'
                              ? 'bg-green-400/20 text-green-400'
                              : 'bg-red-400/20 text-red-400'
                          }`}>
                            {transaction.status === 'COMPLETED' ? 'Selesai' : 'Dibatalkan'}
                          </span>
                        </div>
                        <p className="text-xs text-white/60 mb-2">
                          {transaction.payment_method} • {transaction.items.length} item
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-black text-amber-400 mono">
                            {formatCurrency(transaction.total)}
                          </span>
                          <span className="text-xs text-white/40">
                            {new Date(transaction.created_at).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="p-2 bg-white/5 hover:bg-amber-400/10 border border-white/10 hover:border-amber-400/30 rounded-lg transition-all"
                      >
                        <Eye className="w-4 h-4 text-white/60" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
