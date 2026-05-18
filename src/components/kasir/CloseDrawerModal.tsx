'use client'

import { useState, useMemo } from 'react'
import { X, Wallet, Square, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type CloseDrawerModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: (closingCash: number, notes: string) => Promise<void>
  openingCash: number
  cashSales: number
  isLoading?: boolean
}

export function CloseDrawerModal({
  isOpen,
  onClose,
  onConfirm,
  openingCash,
  cashSales,
  isLoading = false,
}: CloseDrawerModalProps) {
  const [closingCash, setClosingCash] = useState('')
  const [notes, setNotes] = useState('')

  const expectedCash = openingCash + cashSales
  const actualCash = parseInt(closingCash) || 0
  const difference = actualCash - expectedCash

  const differenceStatus = useMemo(() => {
    if (closingCash === '') return 'pending'
    if (difference === 0) return 'match'
    if (difference > 0) return 'surplus'
    return 'shortage'
  }, [closingCash, difference])

  if (!isOpen) return null

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

  // Require notes if there's a difference
  const requireNotes = difference !== 0 && closingCash !== ''
  const canSubmit = closingCash !== '' && (!requireNotes || notes.trim().length > 0)

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
              <p className="text-xs text-white/40">Hitung kas akhir shift</p>
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
          {/* Cash Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <span className="text-xs text-white/60">Modal Awal</span>
              <span className="text-sm font-bold text-white mono">
                {formatCurrency(openingCash)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <span className="text-xs text-white/60">Penjualan Tunai</span>
              <span className="text-sm font-bold text-amber-400 mono">
                {formatCurrency(cashSales)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-400/10 border border-blue-400/20 rounded-xl">
              <span className="text-xs text-blue-400 font-semibold">Kas Seharusnya</span>
              <span className="text-base font-black text-blue-400 mono">
                {formatCurrency(expectedCash)}
              </span>
            </div>
          </div>

          {/* Closing Cash Input */}
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
              Kas Aktual (Hitung Manual) *
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
            <p className="text-[11px] text-white/40 mt-1">
              Hitung jumlah uang tunai di laci kasir saat ini
            </p>
          </div>

          {/* Difference */}
          {closingCash !== '' && (
            <div
              className={`p-4 rounded-xl border ${
                differenceStatus === 'match'
                  ? 'bg-green-400/10 border-green-400/30'
                  : differenceStatus === 'surplus'
                    ? 'bg-blue-400/10 border-blue-400/30'
                    : 'bg-red-400/10 border-red-400/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {differenceStatus === 'match' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertTriangle
                    className={`w-4 h-4 ${
                      differenceStatus === 'surplus' ? 'text-blue-400' : 'text-red-400'
                    }`}
                  />
                )}
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    differenceStatus === 'match'
                      ? 'text-green-400'
                      : differenceStatus === 'surplus'
                        ? 'text-blue-400'
                        : 'text-red-400'
                  }`}
                >
                  {differenceStatus === 'match'
                    ? 'Kas Sesuai'
                    : differenceStatus === 'surplus'
                      ? 'Kas Berlebih (Surplus)'
                      : 'Kas Kurang (Shortage)'}
                </span>
              </div>
              <div
                className={`text-2xl font-black mono ${
                  differenceStatus === 'match'
                    ? 'text-green-400'
                    : differenceStatus === 'surplus'
                      ? 'text-blue-400'
                      : 'text-red-400'
                }`}
              >
                {difference >= 0 ? '+' : ''}
                {formatCurrency(difference)}
              </div>
              {differenceStatus !== 'match' && (
                <p className="text-[11px] text-white/60 mt-2">
                  Selisih akan dicatat. Mohon berikan catatan alasan selisih.
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
              Catatan {requireNotes && <span className="text-red-400">*</span>}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                requireNotes
                  ? 'Wajib: Jelaskan alasan selisih kas...'
                  : 'Catatan saat menutup shift (opsional)...'
              }
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none ${
                requireNotes && !notes.trim()
                  ? 'border-red-400/30 focus:border-red-400/50'
                  : 'border-white/10 focus:border-amber-400/30'
              }`}
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
