'use client'

import { useState, useEffect } from 'react'
import { Clock, Users, DollarSign, ShoppingCart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/hooks/use-toast'

type Shift = {
  id: string
  kasir_id: string
  started_at: string
  ended_at: string | null
  total_sales: number
  total_transactions: number
  kasir: {
    id: string
    name: string
    email: string
  }
}

export default function ShiftPage() {
  const { toast } = useToast()
  const [shifts, setShifts] = useState<Shift[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchShifts()
  }, [])

  const fetchShifts = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/shifts')
      if (res.ok) {
        const data = await res.json()
        setShifts(data)
      }
    } catch (error) {
      console.error('Error fetching shifts:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data shift',
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const calculateDuration = (start: string, end: string | null) => {
    const startDate = new Date(start)
    const endDate = end ? new Date(end) : new Date()
    const diff = endDate.getTime() - startDate.getTime()
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}j ${minutes}m`
  }

  const activeShifts = shifts.filter(s => !s.ended_at)
  const completedShifts = shifts.filter(s => s.ended_at)

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-black text-white">Monitor Shift</h1>
        <p className="text-sm text-white/40 mt-1">
          {activeShifts.length} shift aktif • {completedShifts.length} shift selesai
        </p>
      </div>

      {isLoading ? (
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-8">
            <LoadingSpinner size="lg" />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Active Shifts */}
          {activeShifts.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-white/60 px-2">Shift Aktif</h2>
              {activeShifts.map((shift) => (
                <Card key={shift.id} className="bg-gradient-to-br from-green-400/10 to-emerald-500/10 border-green-400/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center text-lg font-black text-white">
                        {shift.kasir.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white">{shift.kasir.name}</span>
                          <span className="px-2 py-0.5 bg-green-400/20 border border-green-400/30 rounded text-xs font-semibold text-green-400">
                            AKTIF
                          </span>
                        </div>
                        <p className="text-xs text-white/60 mb-3">
                          Mulai: {formatDateTime(shift.started_at)} • Durasi: {calculateDuration(shift.started_at, null)}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                            <DollarSign className="w-4 h-4 text-amber-400" />
                            <div>
                              <p className="text-xs text-white/40">Penjualan</p>
                              <p className="text-sm font-bold text-white mono">{formatCurrency(shift.total_sales)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                            <ShoppingCart className="w-4 h-4 text-blue-400" />
                            <div>
                              <p className="text-xs text-white/40">Transaksi</p>
                              <p className="text-sm font-bold text-white mono">{shift.total_transactions}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Completed Shifts */}
          {completedShifts.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-white/60 px-2">Shift Selesai</h2>
              {completedShifts.slice(0, 10).map((shift) => (
                <Card key={shift.id} className="bg-white/[0.04] border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white/40" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white text-sm">{shift.kasir.name}</span>
                          <span className="px-2 py-0.5 bg-white/10 rounded text-xs font-semibold text-white/60">
                            SELESAI
                          </span>
                        </div>
                        <p className="text-xs text-white/40 mb-2">
                          {formatDateTime(shift.started_at)} - {shift.ended_at && formatDateTime(shift.ended_at)}
                        </p>
                        <p className="text-xs text-white/60">
                          Durasi: {calculateDuration(shift.started_at, shift.ended_at)} • {shift.total_transactions} transaksi • {formatCurrency(shift.total_sales)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {shifts.length === 0 && (
            <Card className="bg-white/[0.04] border-white/10">
              <CardContent className="p-8">
                <EmptyState
                  icon={Users}
                  title="Tidak ada shift"
                  description="Belum ada shift yang tercatat"
                />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
