'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useToast } from '@/hooks/use-toast'
import { ProductModal } from '@/components/superadmin/ProductModal'

type Product = {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  categoryId: string | null
  category?: { name: string }
  isActive: boolean
  emoji: string
}

export default function ProdukPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (search) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredProducts(filtered)
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
      console.error('Error fetching products:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data produk',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast({
          title: 'Berhasil',
          description: 'Produk berhasil dihapus',
        })
        fetchProducts()
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus produk',
        variant: 'destructive',
      })
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  const handleModalSuccess = () => {
    fetchProducts()
    handleModalClose()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Kelola Produk</h1>
          <p className="text-sm text-white/40 mt-1">
            {filteredProducts.length} produk
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Produk
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-white/[0.04] border-white/10">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              type="text"
              placeholder="Cari produk atau SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      {isLoading ? (
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-8">
            <LoadingSpinner size="lg" />
          </CardContent>
        </Card>
      ) : filteredProducts.length === 0 ? (
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-8">
            <EmptyState
              icon={Package}
              title="Belum ada produk"
              description="Tambahkan produk pertama Anda"
              action={
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-amber-400 hover:bg-amber-500 text-gray-900"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Produk
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="bg-white/[0.04] border-white/10 hover:bg-white/[0.06] transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {/* Emoji/Icon */}
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {product.emoji || '📦'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white truncate">{product.name}</h3>
                      {!product.isActive && (
                        <StatusBadge status="error">Nonaktif</StatusBadge>
                      )}
                      {product.stock <= 5 && product.stock > 0 && (
                        <StatusBadge status="warning">Stok Rendah</StatusBadge>
                      )}
                      {product.stock === 0 && (
                        <StatusBadge status="error">Habis</StatusBadge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span className="mono">{product.sku}</span>
                      {product.category && (
                        <>
                          <span>•</span>
                          <span>{product.category.name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Price & Stock */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-amber-400 mono text-sm">
                      {formatCurrency(product.price)}
                    </div>
                    <div className="text-xs text-white/40 mt-1">
                      Stok: <span className="font-semibold text-white">{product.stock}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 bg-white/5 hover:bg-blue-400/10 border border-white/10 hover:border-blue-400/30 rounded-lg transition-all"
                    >
                      <Edit className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 bg-white/5 hover:bg-red-400/10 border border-white/10 hover:border-red-400/30 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        product={selectedProduct}
      />
    </div>
  )
}
