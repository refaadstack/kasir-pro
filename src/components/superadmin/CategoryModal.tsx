'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

type Category = {
  id: string
  name: string
  created_at: string
}

type CategoryModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  category?: Category | null
}

export function CategoryModal({ isOpen, onClose, onSuccess, category }: CategoryModalProps) {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name)
      } else {
        setName('')
      }
    }
  }, [isOpen, category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Nama kategori harus diisi',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const url = category ? `/api/categories/${category.id}` : '/api/categories'
      const method = category ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })

      if (res.ok) {
        toast({
          title: 'Berhasil',
          description: category ? 'Kategori berhasil diupdate' : 'Kategori berhasil ditambahkan',
        })
        onSuccess()
      } else {
        const error = await res.json()
        throw new Error(error.error || 'Gagal menyimpan kategori')
      }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-md bg-[#0d0d14] border-white/10">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-white">
              {category ? 'Edit Kategori' : 'Tambah Kategori'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-white mb-2 block">
                Nama Kategori
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Makanan, Minuman, Snack"
                className="bg-white/5 border-white/10 text-white"
                disabled={isLoading}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1 border-white/10 text-white hover:bg-white/5"
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold"
              >
                {isLoading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
