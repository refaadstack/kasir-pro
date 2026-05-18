'use client'

import { useState } from 'react'
import { X, Wallet, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type CloseDrawerModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: (closingCash: number, notes: string) => Promise<void>
  isLoading?: boolean
}

export function CloseDrawerModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: CloseDrawerModalProps) {
  const [closingCash, setClosingCash] = useState('')
  const [notes, setNotes] = useState('')

  if (!isOpen) return null

  const actualCash = parseInt(closingCash) || 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleConfirm = async () => {
    await onConfirm(actualCash, notes)
    setClosingCash('')
    setNotes('')
  }

  const handleClose = () => {
    if (isLoading) return
    setClosingCash('')
    setNotes('')
    onClose()
  }

  const canSubmit = closingCash !== ''

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-md bg-[#16161f] border border-white/10 rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-400/20 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Tutup Cash Drawer</h2>
              <p className="text-xs text-white/40">Hitung uang tunai di laci kas</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Info */}
          <div className="p-4 bg-amber-400/10 border border-amber-400/20 rounded-xl">
            <p className="text-xs text-amber-400">
              Hitung semua uang tunai di laci kas Anda sekarang. Sistem akan menghitung selisih setelah Anda submit.
            </p>
          </div>

          {/* Closing Cash Display */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <div className="text-xs text-white/60 mb-1">Jumlah Kas Aktual</div>
            <div className="text-3xl font-black text-white mono">
              {formatCurrency(actualCash)}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
              Hitung Uang di Laci Kas *
            </label>
            <Input
              type="number"
              value={closingCash}
              onChange={(e) => setClosingCash(e.target.value)}
              placeholder="0"
              className="bg-white/5 border-white/10 text-white text-xl font-bold mono"
              min="0"
              autoFocus
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
              Catatan (Opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan saat menutup shift..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-white/20"
              rows={2}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-white/10">
          <Button
            type="button"
            onClick={handleClose}
            variant="outline"
            className="flex-1 border-white/10 text-white hover:bg-white/5"
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canSubmit || isLoading}
            className="flex-1 bg-red-400 hover:bg-red-500 text-white font-bold"
          >
            <Square className="w-4 h-4 mr-2" />
            {isLoading ? 'Menutup...' : 'Tutup Shift'}
          </Button>
        </div>
      </div>
    </div>
  )
}
