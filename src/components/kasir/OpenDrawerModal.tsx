'use client'

import { useState } from 'react'
import { X, Wallet, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type OpenDrawerModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: (openingCash: number, notes: string) => Promise<void>
  isLoading?: boolean
}

const QUICK_AMOUNTS = [0, 100000, 200000, 500000, 1000000]

export function OpenDrawerModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: OpenDrawerModalProps) {
  const [openingCash, setOpeningCash] = useState('')
  const [notes, setNotes] = useState('')

  if (!isOpen) return null

  const cashAmount = parseInt(openingCash) || 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleQuickAmount = (amount: number) => {
    setOpeningCash(amount.toString())
  }

  const handleConfirm = async () => {
    await onConfirm(cashAmount, notes)
    setOpeningCash('')
    setNotes('')
  }

  const handleClose = () => {
    if (isLoading) return
    setOpeningCash('')
    setNotes('')
    onClose()
  }

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
            <div className="w-10 h-10 bg-green-400/20 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Buka Cash Drawer</h2>
              <p className="text-xs text-white/40">Hitung modal kas awal</p>
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
          {/* Opening Cash Display */}
          <div className="p-4 bg-green-400/10 border border-green-400/20 rounded-xl">
            <div className="text-xs text-white/60 mb-1">Modal Kas Awal</div>
            <div className="text-3xl font-black text-green-400 mono">
              {formatCurrency(cashAmount)}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
              Jumlah Modal Kas *
            </label>
            <Input
              type="number"
              value={openingCash}
              onChange={(e) => setOpeningCash(e.target.value)}
              placeholder="0"
              className="bg-white/5 border-white/10 text-white text-xl font-bold mono"
              min="0"
              autoFocus
            />
            <p className="text-[11px] text-white/40 mt-1">
              Masukkan jumlah uang tunai di laci kasir saat ini
            </p>
          </div>

          {/* Quick Amounts */}
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
              Pilih Cepat
            </label>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleQuickAmount(amount)}
                  className={`p-2 rounded-lg text-xs font-semibold border transition-all ${
                    cashAmount === amount
                      ? 'bg-green-400/10 border-green-400/30 text-green-400'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {amount === 0 ? 'Kosong' : formatCurrency(amount)}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
              Catatan (Opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan saat membuka shift..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-green-400/30"
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
            disabled={isLoading}
            className="flex-1 bg-green-400 hover:bg-green-500 text-gray-900 font-bold"
          >
            <Play className="w-4 h-4 mr-2" />
            {isLoading ? 'Memulai...' : 'Mulai Shift'}
          </Button>
        </div>
      </div>
    </div>
  )
}
