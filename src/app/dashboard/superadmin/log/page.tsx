'use client'

import { useState, useEffect } from 'react'
import { Search, Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/hooks/use-toast'

type ActivityLog = {
  id: string
  user_id: string
  action: string
  detail: string | null
  created_at: string
  user?: {
    name: string
  }
}

const actionLabels: Record<string, { label: string; color: string }> = {
  CREATE_TRANSACTION: { label: 'Transaksi Baru', color: 'text-green-400' },
  OPEN_DRAWER: { label: 'Buka Shift', color: 'text-blue-400' },
  CLOSE_DRAWER: { label: 'Tutup Shift', color: 'text-purple-400' },
  VOID: { label: 'Void Transaksi', color: 'text-red-400' },
  CREATE_PRODUCT: { label: 'Tambah Produk', color: 'text-blue-400' },
  UPDATE_PRODUCT: { label: 'Update Produk', color: 'text-yellow-400' },
  DELETE_PRODUCT: { label: 'Hapus Produk', color: 'text-red-400' },
  CREATE_CATEGORY: { label: 'Tambah Kategori', color: 'text-blue-400' },
  UPDATE_CATEGORY: { label: 'Update Kategori', color: 'text-yellow-400' },
  DELETE_CATEGORY: { label: 'Hapus Kategori', color: 'text-red-400' },
  UPDATE_SETTINGS: { label: 'Update Pengaturan', color: 'text-purple-400' },
  DB_PING: { label: 'System Ping', color: 'text-gray-400' },
}

export default function LogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchLogs()
  }, [])

  useEffect(() => {
    let filtered = logs

    if (search) {
      filtered = filtered.filter(log => 
        (log.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.detail?.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (actionFilter) {
      filtered = filtered.filter(log => log.action === actionFilter)
    }

    setFilteredLogs(filtered)
  }, [search, actionFilter, logs])

  const fetchLogs = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/logs?limit=100')
      if (res.ok) {
        const data = await res.json()
        setLogs(data)
        setFilteredLogs(data)
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat activity log',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getActionInfo = (action: string) => {
    return actionLabels[action] || { label: action, color: 'text-white' }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Baru saja'
    if (diffMins < 60) return `${diffMins} menit lalu`
    if (diffHours < 24) return `${diffHours} jam lalu`
    if (diffDays < 7) return `${diffDays} hari lalu`
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Get unique actions for filter
  const uniqueActions = Array.from(new Set(logs.map(log => log.action)))

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white">Activity Log</h1>
        <p className="text-sm text-white/40 mt-1">
          {filteredLogs.length} aktivitas tercatat
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-white/[0.04] border-white/10">
        <CardContent className="p-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              type="text"
              placeholder="Cari aktivitas, user, atau detail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>

          {/* Action Filter */}
          {uniqueActions.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              <button
                onClick={() => setActionFilter(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  actionFilter === null
                    ? 'bg-amber-400 text-gray-900'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                Semua
              </button>
              {uniqueActions.slice(0, 5).map((action) => (
                <button
                  key={action}
                  onClick={() => setActionFilter(action)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    actionFilter === action
                      ? 'bg-amber-400 text-gray-900'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {getActionInfo(action).label}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logs List */}
      {isLoading ? (
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-8">
            <LoadingSpinner size="lg" />
          </CardContent>
        </Card>
      ) : filteredLogs.length === 0 ? (
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-8">
            <EmptyState
              icon={Activity}
              title="Tidak ada aktivitas"
              description="Belum ada aktivitas yang tercatat"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredLogs.map((log) => {
            const actionInfo = getActionInfo(log.action)
            return (
              <Card key={log.id} className="bg-white/[0.04] border-white/10 hover:bg-white/[0.06] transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <Activity className="w-5 h-5 text-amber-400" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-white text-sm">{log.user?.name || 'System'}</span>
                        <span className="text-white/40">•</span>
                        <span className={`text-sm font-semibold ${actionInfo.color}`}>
                          {actionInfo.label}
                        </span>
                      </div>
                      {log.detail && (
                        <p className="text-xs text-white/40 mt-1">{log.detail}</p>
                      )}
                      <p className="text-xs text-white/30 mt-2">{formatDate(log.created_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
