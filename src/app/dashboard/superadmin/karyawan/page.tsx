'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Users as UsersIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { RoleBadge } from '@/components/layout/RoleBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useToast } from '@/hooks/use-toast'
import { KaryawanModal } from '@/components/superadmin/KaryawanModal'

type User = {
  id: string
  name: string
  email: string
  role: 'KASIR' | 'SUPERVISOR' | 'SUPERADMIN' | 'MANAGER'
  isActive: boolean
  phone?: string
}

export default function KaryawanPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (search) {
      const filtered = users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [search, users])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
        setFilteredUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data karyawan',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus karyawan ini?')) return

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast({
          title: 'Berhasil',
          description: 'Karyawan berhasil dihapus',
        })
        fetchUsers()
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus karyawan',
        variant: 'destructive',
      })
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedUser(null)
  }

  const handleModalSuccess = () => {
    fetchUsers()
    handleModalClose()
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Kelola Karyawan</h1>
          <p className="text-sm text-white/40 mt-1">
            {filteredUsers.length} karyawan
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Karyawan
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-white/[0.04] border-white/10">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              type="text"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      {isLoading ? (
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-8">
            <LoadingSpinner size="lg" />
          </CardContent>
        </Card>
      ) : filteredUsers.length === 0 ? (
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-8">
            <EmptyState
              icon={UsersIcon}
              title="Belum ada karyawan"
              description="Tambahkan karyawan pertama Anda"
              action={
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-amber-400 hover:bg-amber-500 text-gray-900"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Karyawan
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="bg-white/[0.04] border-white/10 hover:bg-white/[0.06] transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-xl font-black text-gray-900 flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white truncate">{user.name}</h3>
                      <RoleBadge role={user.role} />
                      {!user.isActive && (
                        <StatusBadge status="error">Nonaktif</StatusBadge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span>{user.email}</span>
                      {user.phone && (
                        <>
                          <span>•</span>
                          <span>{user.phone}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-2 bg-white/5 hover:bg-blue-400/10 border border-white/10 hover:border-blue-400/30 rounded-lg transition-all"
                    >
                      <Edit className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
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
      <KaryawanModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        user={selectedUser}
      />
    </div>
  )
}
