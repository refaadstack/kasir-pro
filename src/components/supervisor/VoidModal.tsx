'use client'

import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PinPad } from '@/components/ui/PinPad'
import { useToast } from '@/hooks/use-toast'

type VoidModalProps = {
  transactionId: string
  transactionCode: string
  onClose: () => void
  onSuccess: () => void
}

export function VoidModal({ transactionId, transactionCode, onClose, onSuccess }: VoidModalProps) {
  const { toast } = useToast()
  const [reason, setReason] = useState('')
  const [pin, setPin] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPinPad, setShowPinPad] = useState(false)

  const handlePinComplete = (completedPin: string) => {
    setPin(completedPin)
    setShowPinPad(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (reason.length < 5) {
      toast({
        title: 'Error',
        description: 'Alasan minimal 5 karakter',
        variant: 'destructive',
      })
      return
    }

    if (pin.length !== 4) {
      toast({
        title: 'Error',
        description: 'PIN harus 4 digit',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSubmitting(true)
      const res = await fetch(`/api/transactions/${transactionId}/void`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, pin }),
      })

      if (res.ok) {
        toast({
          title: 'Berhasil',
          description: 'Transaksi berhasil dibatalkan',
        })
        onSuccess()
        onClose()
      } else {
        const error = await res.json()
        toast({
          title: 'Error',
          description: error.error || 'Gagal membatalkan transaksi',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error voiding transaction:', error)
      toast({
        title: 'Error',
        description: 'Gagal membatalkan transaksi',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-md bg-[#0d0d14] border-white/10">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-white">Batalkan Transaksi</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Warning */}
          <div className="flex gap-3 p-4 bg-red-400/10 border border-red-400/20 rounded-xl mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-400 text-sm">Peringatan</h3>
              <p className="text-xs text-red-400/80 mt-1">
                Tindakan ini akan membatalkan transaksi <span className="font-bold">{transactionCode}</span> dan mengembalikan stok produk. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Reason */}
            <div>
              <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">
                Alasan Pembatalan *
              </label>
              <Input
                type="text"
                placeholder="Contoh: Salah input, customer batal, dll"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-2 bg-white/5 border-white/10 text-white"
                required
                minLength={5}
              />
              <p className="text-xs text-white/40 mt-1">Minimal 5 karakter</p>
            </div>

            {/* PIN */}
            <div>
              <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">
                PIN Supervisor *
              </label>
              {showPinPad ? (
                <div className="mt-2">
                  <PinPad onComplete={handlePinComplete} />
                </div>
              ) : (
                <div className="mt-2">
                  <Input
                    type="password"
                    placeholder="••••"
                    value={pin}
                    onClick={() => setShowPinPad(true)}
                    readOnly
                    className="bg-white/5 border-white/10 text-white text-center text-2xl tracking-widest font-mono cursor-pointer"
                  />
                  <p className="text-xs text-white/40 mt-1">Klik untuk memasukkan PIN</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1 border-white/10 text-white hover:bg-white/5"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || reason.length < 5 || pin.length !== 4}
                className="flex-1 bg-red-400 hover:bg-red-500 text-white font-bold"
              >
                {isSubmitting ? 'Memproses...' : 'Batalkan Transaksi'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
