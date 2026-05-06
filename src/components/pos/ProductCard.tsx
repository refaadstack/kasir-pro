'use client'

import { Package } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'

import { Product } from '@/hooks/useProducts'

type ProductCardProps = {
  product: Product
  onAdd: (product: Product) => void
  isBestSeller?: boolean
}

export function ProductCard({ product, onAdd, isBestSeller }: ProductCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock > 0 && product.stock <= 5
  const canAdd = product.is_active && !isOutOfStock

  return (
    <button
      onClick={() => canAdd && onAdd(product)}
      disabled={!canAdd}
      className={`
        relative p-4 rounded-xl border transition-all text-left
        ${canAdd 
          ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-amber-400/30 hover:scale-105 cursor-pointer' 
          : 'bg-white/[0.02] border-white/5 opacity-50 cursor-not-allowed'
        }
      `}
    >
      {/* Best Seller Badge */}
      {isBestSeller && canAdd && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 text-[9px] font-black px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <span>🏆</span>
            <span>BEST</span>
          </div>
        </div>
      )}

      {/* Product Icon/Emoji */}
      <div className="w-full aspect-square bg-white/5 rounded-lg flex items-center justify-center mb-3 text-4xl">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-lg" />
        ) : (
          <Package className="w-8 h-8 text-white/20" />
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-2">
        <h3 className="font-bold text-white text-sm line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="text-lg font-black text-amber-400 mono">
          {formatCurrency(product.price)}
        </div>

        {/* Stock Status */}
        <div className="flex items-center gap-1 flex-wrap">
          {isOutOfStock && (
            <StatusBadge status="error">Habis</StatusBadge>
          )}
          {isLowStock && (
            <StatusBadge status="warning">Stok: {product.stock}</StatusBadge>
          )}
          {!isOutOfStock && !isLowStock && (
            <span className="text-[10px] text-white/40">Stok: {product.stock}</span>
          )}
        </div>
      </div>
    </button>
  )
}
