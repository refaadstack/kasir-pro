'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Tag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/hooks/use-toast'
import { CategoryModal } from '@/components/superadmin/CategoryModal'

type Category = {
  id: string
  name: string
  created_at: string
}

export default function KategoriPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (search) {
      const filtered = categories.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredCategories(filtered)
    } else {
      setFilteredCategories(categories)
    }
  }, [search, categories])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
        setFilteredCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data kategori',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kategori ini? Produk dengan kategori ini akan kehilangan kategorinya.')) return

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast({
          title: 'Berhasil',
          description: 'Kategori berhasil dihapus',
        })
        fetchCategories()
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus kategori',
        variant: 'destructive',
      })
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedCategory(null)
  }

  const handleModalSuccess = () => {
    fetchCategories()
    handleModalClose()
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Kelola Kategori</h1>
          <p className="text-sm text-white/40 mt-1">
            {filteredCategories.length} kategori
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kategori
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-white/[0.04] border-white/10">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              type="text"
              placeholder="Cari kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories List */}
      {isLoading ? (
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-8">
            <LoadingSpinner size="lg" />
          </CardContent>
        </Card>
      ) : filteredCategories.length === 0 ? (
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-8">
            <EmptyState
              icon={Tag}
              title="Belum ada kategori"
              description="Tambahkan kategori pertama Anda"
              action={
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-amber-400 hover:bg-amber-500 text-gray-900"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Kategori
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="bg-white/[0.04] border-white/10 hover:bg-white/[0.06] transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-amber-400/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Tag className="w-6 h-6 text-amber-400" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">{category.name}</h3>
                    <div className="text-xs text-white/40 mt-1">
                      {new Date(category.created_at).toLocaleDateString('id-ID')}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 bg-white/5 hover:bg-blue-400/10 border border-white/10 hover:border-blue-400/30 rounded-lg transition-all"
                    >
                      <Edit className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
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
      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        category={selectedCategory}
      />
    </div>
  )
}
