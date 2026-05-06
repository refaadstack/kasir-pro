'use client'

import { useState, useEffect } from 'react'
import { Clock, Play, Square, DollarSign, ShoppingCart, Timer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'
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
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeShift, setActiveShift] = useState<Shift | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [duration, setDuration] = useState('')

  useEffect(() => {
    if (user) {
      fetchActiveShift()
    }
  }, [user])

  // Update duration every second
  useEffect(() => {
    if (activeShift && !activeShift.ended_at) {
      const interval = setInterval(() => {
        const start = new Date(activeShift.started_at)
        const now = new Date()
        const diff = now.getTime() - start.getTime()
        
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        
        setDuration(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [activeShift])

  const fetchActiveShift = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/shifts?active=true&kasir_id=${user?.id}`)
      if (res.ok) {
        const data = await res.json()
        setActiveShift(data[0] || null)
      }
    } catch (error) {
      console.error('Error fetching active shift:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartShift = async () => {
    if (!user) return

    try {
      setIsStarting(true)
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kasir_id: user.id }),
      })

      if (res.ok) {
        const shift = await res.json()
        setActiveShift(shift)
        toast({
          title: 'Shift Dimulai',
          description: 'Shift Anda telah dimulai',
        })
      } else {
        const error = await res.json()
        toast({
          title: 'Error',
          description: error.error || 'Gagal memulai shift',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error starting shift:', error)
      toast({
        title: 'Error',
        description: 'Gagal memulai shift',
        variant: 'destructive',
      })
    } finally {
      setIsStarting(false)
    }
  }

  const handleEndShift = async () => {
    if (!activeShift) return

    try {
      setIsEnding(true)
      const res = await fetch(`/api/shifts/${activeShift.id}`, {
        method: 'PATCH',
      })

      if (res.ok) {
        const endedShift = await res.json()
        toast({
          title: 'Shift Ditutup',
          description: `${endedShift.total_transactions} transaksi, ${formatCurrency(endedShift.total_sales)}`,
        })
        setActiveShift(null)
      } else {
        const error = await res.json()
        toast({
          title: 'Error',
          description: error.error || 'Gagal menutup shift',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error ending shift:', error)
      toast({
        title: 'Error',
        description: 'Gagal menutup shift',
        variant: 'destructive',
      })
    } finally {
      setIsEnding(false)
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

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white">Shift Management</h1>
        <p className="text-sm text-white/40 mt-1">
          Kelola shift kerja Anda
        </p>
      </div>

      {/* Active Shift Status */}
      {activeShift ? (
        <>
          {/* Shift Info Card */}
          <Card className="bg-gradient-to-br from-green-400/10 to-emerald-500/10 border-green-400/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-400/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white">Shift Aktif</h3>
                  <p className="text-sm text-white/60">
                    Dimulai: {formatDateTime(activeShift.started_at)}
                  </p>
                </div>
                <div className="px-3 py-1.5 bg-green-400/20 border border-green-400/30 rounded-lg">
                  <span className="text-xs font-semibold text-green-400">ACTIVE</span>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-center justify-center gap-2 p-4 bg-white/5 rounded-xl mb-4">
                <Timer className="w-5 h-5 text-amber-400" />
                <span className="text-3xl font-black text-amber-400 mono">{duration}</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-white/60">Total Penjualan</span>
                  </div>
                  <p className="text-lg font-black text-white mono">
                    {formatCurrency(activeShift.total_sales)}
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingCart className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-white/60">Transaksi</span>
                  </div>
                  <p className="text-lg font-black text-white mono">
                    {activeShift.total_transactions}
                  </p>
                </div>
              </div>

              {/* End Shift Button */}
              <Button
                onClick={handleEndShift}
                disabled={isEnding}
                className="w-full bg-red-400 hover:bg-red-500 text-white font-bold"
              >
                <Square className="w-4 h-4 mr-2" />
                {isEnding ? 'Menutup Shift...' : 'Tutup Shift'}
              </Button>
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="bg-blue-400/10 border-blue-400/20">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-400 text-sm">Shift Sedang Berjalan</h3>
                  <p className="text-xs text-blue-400/80 mt-1">
                    Anda dapat melakukan transaksi. Tutup shift saat selesai bekerja untuk melihat ringkasan.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* No Active Shift */}
          <Card className="bg-white/[0.04] border-white/10">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Tidak Ada Shift Aktif</h3>
              <p className="text-sm text-white/60 mb-6">
                Mulai shift untuk dapat melakukan transaksi
              </p>
              <Button
                onClick={handleStartShift}
                disabled={isStarting}
                className="bg-green-400 hover:bg-green-500 text-gray-900 font-bold"
              >
                <Play className="w-4 h-4 mr-2" />
                {isStarting ? 'Memulai Shift...' : 'Mulai Shift'}
              </Button>
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="bg-amber-400/10 border-amber-400/20">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-400 text-sm">Mulai Shift Terlebih Dahulu</h3>
                  <p className="text-xs text-amber-400/80 mt-1">
                    Anda harus memulai shift sebelum dapat melakukan transaksi. Shift akan mencatat semua aktivitas penjualan Anda.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
