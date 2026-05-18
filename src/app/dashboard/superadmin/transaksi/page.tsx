'use client'

import { useState, useEffect } from 'react'
import { Search, Receipt, Ban, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/hooks/use-toast'

type Transaction = {
  id: string
  trx_code: string
  total_amount: number
  payment_method: string
  status: string
  created_at: string
  void_reason: string | null
}

export default function TransaksiPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [voidModal, setVoidModal] = useState<{ open: boolean; transaction: Transaction | null }>({ open: false, transaction: null })
  const [voidReason, setVoidReason] = useState('')
  const [voidPin, setVoidPin] = useState('')
  const [isVoiding, setIsVoiding] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    let filtered = transactions
    if (search) {
      filtered = filtered.filter(t => t.trx_code.toLowerCase().includes(search.toLowerCase()))
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
      console.error('Error:', error)
      toast({ title: 'Error', description: 'Gagal memuat transaksi', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoid = async () => {
    if (!voidModal.transaction || !voidReason || !voidPin) return

    try {
      setIsVoiding(true)
      const res = await fetch(`/api/transactions/${voidModal.transaction.id}/void`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: voidReason, pin: voidPin }),
      })

      if (res.ok) {
        toast({ title: 'Berhasil', description: 'Transaksi berhasil di-void' })
        setVoidModal({ open: false, transaction: null })
        setVoidReason('')
        setVoidPin('')
        fetchTransactions()
      } else {
        const error = await res.json()
        toast({ title: 'Gagal', description: error.error || 'Gagal void transaksi', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setIsVoiding(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-black text-white">Riwayat Transaksi</h1>
        <p className="text-sm text-white/40 mt-1">{filteredTransactions.length} transaksi</p>
      </div>

      {/* Filters */}
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

      {/* List */}
      {isLoading ? (
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-8"><LoadingSpinner size="lg" /></CardContent>
        </Card>
      ) : filteredTransactions.length === 0 ? (
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-8">
            <EmptyState icon={Receipt} title="Tidak ada transaksi" description="Belum ada transaksi" />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="bg-white/[0.04] border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Receipt className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-white text-sm mono">{transaction.trx_code}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        transaction.status === 'SUCCESS' ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'
                      }`}>
                        {transaction.status === 'SUCCESS' ? 'Selesai' : 'Void'}
                      </span>
                    </div>
                    <p className="text-xs text-white/60">
                      {transaction.payment_method} • {formatDate(transaction.created_at)}
                      {transaction.void_reason && <span className="text-red-400"> • {transaction.void_reason}</span>}
                    </p>
                  </div>
                  <span className="text-lg font-black text-amber-400 mono flex-shrink-0">
                    {formatCurrency(transaction.total_amount)}
                  </span>
                  {transaction.status === 'SUCCESS' && (
                    <button
                      onClick={() => setVoidModal({ open: true, transaction })}
                      className="p-2 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 hover:border-red-400/40 rounded-lg transition-all flex-shrink-0"
                      title="Void Transaksi"
                    >
                      <Ban className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Void Modal */}
      {voidModal.open && voidModal.transaction && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setVoidModal({ open: false, transaction: null })} />
          <div className="relative w-full max-w-md bg-[#16161f] border border-white/10 rounded-t-3xl md:rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <h2 className="text-lg font-bold text-white">Void Transaksi</h2>
                <p className="text-xs text-white/40">{voidModal.transaction.trx_code}</p>
              </div>
              <button onClick={() => setVoidModal({ open: false, transaction: null })} className="p-2 hover:bg-white/5 rounded-lg">
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="p-3 bg-red-400/10 border border-red-400/20 rounded-xl">
                <p className="text-xs text-red-400">
                  Void akan membatalkan transaksi {formatCurrency(voidModal.transaction.total_amount)} dan mengembalikan stok produk.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">Alasan Void *</label>
                <textarea
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="Masukkan alasan void..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-red-400/30"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">PIN Verifikasi *</label>
                <Input
                  type="password"
                  value={voidPin}
                  onChange={(e) => setVoidPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Masukkan PIN 4 digit"
                  className="bg-white/5 border-white/10 text-white text-center text-2xl tracking-widest mono"
                  maxLength={4}
                />
              </div>
            </div>

            <div className="flex gap-2 p-4 border-t border-white/10">
              <Button onClick={() => setVoidModal({ open: false, transaction: null })} variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/5">
                Batal
              </Button>
              <Button
                onClick={handleVoid}
                disabled={!voidReason || voidPin.length !== 4 || isVoiding}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold"
              >
                {isVoiding ? 'Memproses...' : 'Void Transaksi'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
