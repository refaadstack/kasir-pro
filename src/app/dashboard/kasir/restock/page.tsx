'use client'

import { useState, useEffect } from 'react'
import { Search, Package, Plus, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/hooks/use-toast'

type Product = {
  id: string
  name: string
  stock: number
  price: number
  emoji: string | null
  is_active: boolean
}

export default function RestockPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [restockModal, setRestockModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null })
  const [qty, setQty] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (search) {
      setFilteredProducts(products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())))
    } else {
      setFilteredProducts(products)
    }
  }, [search, products])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
        setFilteredProducts(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestock = async () => {
    if (!restockModal.product || !qty) return
    const qtyNum = parseInt(qty)
    if (qtyNum < 1) return

    try {
      setIsSubmitting(true)
      const res = await fetch('/api/products/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: restockModal.product.id,
          qty: qtyNum,
          notes: notes || undefined,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        toast({
          title: 'Stok Ditambahkan',
          description: `${restockModal.product.name}: +${qtyNum} (total: ${data.newStock})`,
        })
        setRestockModal({ open: false, product: null })
        setQty('')
        setNotes('')
        fetchProducts()
      } else {
        const error = await res.json()
        toast({ title: 'Gagal', description: error.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal restock', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-8"><LoadingSpinner size="lg" /></CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-black text-white">Restock Produk</h1>
        <p className="text-sm text-white/40 mt-1">Tambah stok produk yang ada</p>
      </div>

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

      {/* Products */}
      {filteredProducts.length === 0 ? (
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-8">
            <EmptyState icon={Package} title="Tidak ada produk" description="Produk tidak ditemukan" />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="bg-white/[0.04] border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                    {product.emoji || '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm truncate">{product.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <span>{formatCurrency(product.price)}</span>
                      <span>•</span>
                      <span className={product.stock <= 5 ? 'text-red-400 font-semibold' : ''}>
                        Stok: {product.stock}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setRestockModal({ open: true, product })}
                    size="sm"
                    className="bg-green-400 hover:bg-green-500 text-gray-900 font-bold"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Restock
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Restock Modal */}
      {restockModal.open && restockModal.product && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setRestockModal({ open: false, product: null })} />
          <div className="relative w-full max-w-sm bg-[#16161f] border border-white/10 rounded-t-3xl md:rounded-2xl shadow-2xl">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Tambah Stok</h2>
              <p className="text-xs text-white/40">{restockModal.product.name}</p>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-xs text-white/60">Stok Saat Ini</span>
                <span className="text-lg font-black text-white mono">{restockModal.product.stock}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
                  Jumlah Tambah *
                </label>
                <Input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="0"
                  className="bg-white/5 border-white/10 text-white text-xl font-bold mono"
                  min="1"
                  autoFocus
                />
              </div>

              {/* Quick amounts */}
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 20, 50].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setQty(amount.toString())}
                    className={`p-2 rounded-lg text-xs font-semibold border transition-all ${
                      qty === amount.toString()
                        ? 'bg-green-400/10 border-green-400/30 text-green-400'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    +{amount}
                  </button>
                ))}
              </div>

              {qty && parseInt(qty) > 0 && (
                <div className="flex items-center justify-between p-3 bg-green-400/10 border border-green-400/20 rounded-xl">
                  <span className="text-xs text-green-400">Stok Baru</span>
                  <span className="text-lg font-black text-green-400 mono">
                    {restockModal.product.stock + parseInt(qty)}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
                  Catatan (Opsional)
                </label>
                <Input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Misal: Restock dari supplier"
                  className="bg-white/5 border-white/10 text-white text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2 p-4 border-t border-white/10">
              <Button onClick={() => setRestockModal({ open: false, product: null })} variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/5">
                Batal
              </Button>
              <Button
                onClick={handleRestock}
                disabled={!qty || parseInt(qty) < 1 || isSubmitting}
                className="flex-1 bg-green-400 hover:bg-green-500 text-gray-900 font-bold"
              >
                <Check className="w-4 h-4 mr-1" />
                {isSubmitting ? 'Menyimpan...' : 'Tambah Stok'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
