'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

type User = {
  id: string
  name: string
  email: string
  role: 'KASIR' | 'SUPERVISOR' | 'SUPERADMIN' | 'MANAGER'
  isActive: boolean
  phone?: string
}

type KaryawanModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user?: User | null
}

export function KaryawanModal({ isOpen, onClose, onSuccess, user }: KaryawanModalProps) {
  const [formData, setFormData] = useState<{
    name: string
    email: string
    pin: string
    role: 'KASIR' | 'SUPERVISOR' | 'MANAGER' | 'SUPERADMIN'
    phone: string
    isActive: boolean
  }>({
    name: '',
    email: '',
    pin: '',
    role: 'KASIR',
    phone: '',
    isActive: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFormData({
          name: user.name,
          email: user.email,
          pin: '',
          role: user.role,
          phone: user.phone || '',
          isActive: user.isActive,
        })
      } else {
        setFormData({
          name: '',
          email: '',
          pin: '',
          role: 'KASIR',
          phone: '',
          isActive: true,
        })
      }
    }
  }, [isOpen, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = user ? `/api/users/${user.id}` : '/api/users'
      const method = user ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan karyawan')
      }

      toast({
        title: 'Berhasil',
        description: user ? 'Karyawan berhasil diupdate' : 'Karyawan berhasil ditambahkan',
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-[#16161f] border border-white/10 rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">
            {user ? 'Edit Karyawan' : 'Tambah Karyawan'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[calc(90vh-140px)] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
              Nama Lengkap *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Budi Santoso"
              className="bg-white/5 border-white/10 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
              Email *
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="budi@kasirpro.com"
              className="bg-white/5 border-white/10 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
              PIN (4 digit) {user && '(kosongkan jika tidak diubah)'}
            </label>
            <Input
              type="text"
              value={formData.pin}
              onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
              placeholder="1234"
              className="bg-white/5 border-white/10 text-white mono text-center text-2xl tracking-widest"
              maxLength={4}
              required={!user}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
              No. Telepon
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="08123456789"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
              required
            >
              <option value="KASIR">Kasir</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="MANAGER">Manager</option>
              <option value="SUPERADMIN">Superadmin</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <div>
              <div className="text-sm font-semibold text-white">Status Aktif</div>
              <div className="text-xs text-white/40">Karyawan dapat login</div>
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
