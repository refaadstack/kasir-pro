'use client'

import { ProductGrid } from '@/components/pos/ProductGrid'
import { CartPanel } from '@/components/pos/CartPanel'
import { useCart } from '@/hooks/useCart'
import { useToast } from '@/hooks/use-toast'
import { Product } from '@/hooks/useProducts'

export default function KasirDashboard() {
  const { addItem } = useCart()
  const { toast } = useToast()

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
    })

    toast({
      title: 'Ditambahkan ke keranjang',
      description: product.name,
    })
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-black text-white">Point of Sale</h1>
        <p className="text-sm text-white/40 mt-1">
          Pilih produk dan proses transaksi
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Product Grid - 2 columns on large screens */}
        <div className="lg:col-span-2">
          <ProductGrid onAddToCart={handleAddToCart} />
        </div>

        {/* Cart Panel - 1 column on large screens */}
        <div>
          <CartPanel />
        </div>
      </div>
    </div>
  )
}
