'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useProducts, Product } from '@/hooks/useProducts'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProductCard } from './ProductCard'

type ProductGridProps = {
  onAddToCart: (product: Product) => void
}

export function ProductGrid({ onAddToCart }: ProductGridProps) {
  const { products, isLoading, search, setSearch, categoryFilter, setCategoryFilter } = useProducts()
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    // Fetch categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error)
  }, [])

  // Find best seller (product with highest total_sold)
  const bestSellerId = products.length > 0 
    ? products.reduce((max, p) => (p.total_sold || 0) > (max.total_sold || 0) ? p : max).id
    : null

  if (isLoading) {
    return (
      <Card className="bg-white/[0.04] border-white/10">
        <CardContent className="p-8">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <Card className="bg-white/[0.04] border-white/10">
        <CardContent className="p-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setCategoryFilter(null)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === null
                  ? 'bg-amber-400 text-gray-900'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  categoryFilter === cat.id
                    ? 'bg-amber-400 text-gray-900'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {products.length === 0 ? (
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-8">
            <EmptyState
              title="Tidak ada produk"
              description="Tidak ada produk yang sesuai dengan pencarian"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={onAddToCart}
              isBestSeller={product.id === bestSellerId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
