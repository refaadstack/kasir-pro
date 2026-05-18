'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

type Product = {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  categoryId: string | null
  emoji: string
  isActive: boolean
  tax_percent: number
}

type ProductModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  product?: Product | null
}

export function ProductModal({ isOpen, onClose, onSuccess, product }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    stock: '',
    categoryId: '',
    emoji: '📦',
    isActive: true,
    tax_percent: '0',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
      if (product) {
        setFormData({
          name: product.name,
          sku: product.sku,
          price: product.price.toString(),
          stock: product.stock.toString(),
          categoryId: product.categoryId || '',
          emoji: product.emoji || '📦',
          isActive: product.isActive,
          tax_percent: (product.tax_percent || 0).toString(),
        })
      } else {
        setFormData({
          name: '',
          sku: '',
          price: '',
          stock: '',
          categoryId: '',
          emoji: '📦',
          isActive: true,
          tax_percent: '0',
        })
      }
    }
  }, [isOpen, product])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = product ? `/api/products/${product.id}` : '/api/products'
      const method = product ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan produk')
      }

      toast({
        title: 'Berhasil',
        description: product ? 'Produk berhasil diupdate' : 'Produk berhasil ditambahkan',
      })

      onSuccess()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#16161f] border border-white/10 rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">
            {product ? 'Edit Produk' : 'Tambah Produk'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Emoji */}
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
              Emoji/Icon
            </label>
            <Input
              type="text"
              value={formData.emoji}
              onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
              placeholder="📦"
              className="bg-white/5 border-white/10 text-white text-2xl text-center"
              maxLength={2}
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
              Nama Produk *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nasi Goreng Spesial"
              className="bg-white/5 border-white/10 text-white"
              required
            />
          </div>

          {/* SKU */}
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
              SKU *
            </label>
            <Input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
              placeholder="MKN-001"
              className="bg-white/5 border-white/10 text-white mono"
              required
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
                Harga *
              </label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="15000"
                className="bg-white/5 border-white/10 text-white"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
                Stok *
              </label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="50"
                className="bg-white/5 border-white/10 text-white"
                required
                min="0"
              />
            </div>
          </div>

          {/* Tax */}
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
              Pajak (%)
            </label>
            <Input
              type="number"
              value={formData.tax_percent}
              onChange={(e) => setFormData({ ...formData, tax_percent: e.target.value })}
              placeholder="0"
              className="bg-white/5 border-white/10 text-white"
              min="0"
              max="100"
              step="0.1"
            />
            <p className="text-[11px] text-white/40 mt-1">Set 0 jika produk tidak kena pajak</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
              Kategori
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
            >
              <option value="">Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <div>
              <div className="text-sm font-semibold text-white">Status Aktif</div>
              <div className="text-xs text-white/40">Produk dapat dijual</div>
            </div>
            <label className="relative inline-block w-12 h-6 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-full h-full bg-white/20 peer-checked:bg-amber-400 rounded-full transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-6 shadow-lg" />
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-white/10">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold"
            disabled={isLoading}
          >
            {isLoading ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </div>
    </div>
  )
}
