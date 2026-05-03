'use client'

import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function CartPanel() {
  const { cart, updateQty, removeItem, totalPrice, totalItems, clearCart } = useCart()

  return (
    <div className="bg-app-card p-6 rounded-2xl shadow-xl h-fit sticky top-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Keranjang ({totalItems})</h3>
        {cart.length > 0 && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={clearCart}
            className="bg-red-500 hover:bg-red-600"
          >
            Kosongkan
          </Button>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
        {cart.map((item) => (
          <div key={item.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
            <div className="text-xl">{item.emoji || '📦'}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white truncate">{item.name}</div>
              <div className="text-sm text-white/70">Rp {item.price.toLocaleString()}</div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQty(item.id, item.qty - 1)}
                className="h-8 w-8 p-0"
              >
                -
              </Button>
              <Badge className="font-mono px-3">{item.qty}</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQty(item.id, item.qty + 1)}
                className="h-8 w-8 p-0"
              >
                +
              </Button>
            </div>
            <div className="text-right text-sm font-bold text-amber-400 min-w-[70px]">
              Rp {(item.price * item.qty).toLocaleString()}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeItem(item.id)}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
            >
              🗑️
            </Button>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex justify-between text-sm font-semibold text-white">
            <span>Total</span>
            <span className="text-2xl text-amber-400">Rp {totalPrice.toLocaleString('id-ID')}</span>
          </div>
          <Button 
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white font-bold py-4 text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all"
            onClick={() => alert('Payment Modal')}
          >
            💳 Bayar
          </Button>
        </div>
      )}

      {cart.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🛒</div>
          <p className="text-white/60">Keranjang kosong</p>
        </div>
      )}
    </div>
  )
}

