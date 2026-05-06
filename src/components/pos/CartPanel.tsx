'use client'

import { useState } from 'react'
import { Trash2, Plus, Minus } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { PaymentModal } from './PaymentModal'

export function CartPanel() {
  const { items, updateQty, removeItem, total, clearCart } = useCart()
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handlePaymentSuccess = () => {
    clearCart()
    setIsPaymentModalOpen(false)
  }

  const totalItems = items.reduce((sum, item) => sum + item.qty, 0)

  return (
    <>
      <div className="bg-white/[0.04] border border-white/10 p-6 rounded-2xl shadow-xl h-fit sticky top-20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">
            Keranjang <span className="text-amber-400">({totalItems})</span>
          </h3>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="p-2 hover:bg-red-400/10 border border-white/10 hover:border-red-400/30 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          )}
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto mb-6 scrollbar-thin">
          {items.map((item) => (
            <div key={item.id} className="p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-start gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm truncate">{item.name}</div>
                  <div className="text-xs text-white/40 mono">{formatCurrency(item.price)}</div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1 hover:bg-red-400/10 rounded transition-colors"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    className="w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
                  >
                    <Minus className="w-3 h-3 text-white" />
                  </button>
                  <span className="w-8 text-center font-bold text-white mono">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
                  >
                    <Plus className="w-3 h-3 text-white" />
                  </button>
                </div>
                <div className="text-sm font-bold text-amber-400 mono">
                  {formatCurrency(item.price * item.qty)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 ? (
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60 font-semibold">Total</span>
              <span className="text-2xl font-black text-amber-400 mono">
                {formatCurrency(total)}
              </span>
            </div>
            <Button
              onClick={() => setIsPaymentModalOpen(true)}
              className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-gray-900 font-bold py-6 text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all"
            >
              💳 Bayar Sekarang
            </Button>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🛒</div>
            <p className="text-white/40 text-sm">Keranjang kosong</p>
            <p className="text-white/20 text-xs mt-1">Pilih produk untuk memulai</p>
          </div>
        )}
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        cart={items}
        total={total}
        onSuccess={handlePaymentSuccess}
      />
    </>
  )
}

