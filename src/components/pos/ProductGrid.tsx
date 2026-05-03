'use client'

import { useCart } from '@/hooks/useCart'

interface Product {
  id: string
  name: string
  price: number
  sku: string
  emoji: string
  soldQty: number
  isBestSeller?: boolean
}

export function ProductGrid({ products }: { products: Product[] }) {
  const { addItem } = useCart()

  const topSellers = products.sort((a, b) => b.soldQty - a.soldQty).slice(0, 3)

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="group cursor-pointer bg-white/10 backdrop-blur p-4 rounded-xl hover:bg-white/20 transition-all group-hover:scale-105 shadow-lg hover:shadow-2xl border border-white/20 hover:border-amber-400"
          onClick={() => addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            sku: product.sku,
          })}
        >
          <div className="text-4xl mb-3">{product.emoji}</div>
          <div className="font-bold text-white text-lg mb-1 leading-tight truncate">
            {product.name}
          </div>
          <div className="text-amber-400 font-bold text-xl mb-3">
            Rp {product.price.toLocaleString('id-ID')}
          </div>
          
          {/* Best Seller Badge */}
          {topSellers.some(p => p.id === product.id) && (
            <div className="flex items-center mb-3">
              <span className="text-xs bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold px-3 py-1 rounded-full shadow-lg mr-2">
                🏆 BEST SELLER #{topSellers.findIndex(p => p.id === product.id) + 1}
              </span>
              <span className="text-xs text-white/70">
                {product.soldQty} terjual
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Stok tersisa</span>
            <span className="text-sm font-semibold text-green-400">✓</span>
          </div>
        </div>
      ))}
    </div>
  )
}

