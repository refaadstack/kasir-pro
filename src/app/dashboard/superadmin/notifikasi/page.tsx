'use client'

import { useState } from 'react'
import { Bell, Mail, MessageSquare, AlertCircle, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

type NotificationSetting = {
  id: string
  label: string
  description: string
  icon: any
  enabled: boolean
}

export default function NotifikasiPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'low_stock',
      label: 'Stok Rendah',
      description: 'Notifikasi saat stok produk menipis',
      icon: AlertCircle,
      enabled: true,
    },
    {
      id: 'new_transaction',
      label: 'Transaksi Baru',
      description: 'Notifikasi setiap ada transaksi baru',
      icon: Bell,
      enabled: false,
    },
    {
      id: 'daily_report',
      label: 'Laporan Harian',
      description: 'Ringkasan penjualan harian via email',
      icon: Mail,
      enabled: true,
    },
    {
      id: 'shift_alerts',
      label: 'Alert Shift',
      description: 'Notifikasi saat shift dimulai/berakhir',
      icon: MessageSquare,
      enabled: false,
    },
  ])

  const toggleSetting = (id: string) => {
    setSettings(prev =>
      prev.map(setting =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    )
  }

  const handleSave = () => {
    // In a real app, this would save to the database
    toast({
      title: 'Berhasil',
      description: 'Pengaturan notifikasi telah disimpan',
    })
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white">Notifikasi</h1>
        <p className="text-sm text-white/40 mt-1">
          Kelola pengaturan notifikasi sistem
        </p>
      </div>

      {/* Info Banner */}
      <Card className="bg-blue-400/10 border-blue-400/20">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Bell className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-400 text-sm">Fitur Dalam Pengembangan</h3>
              <p className="text-xs text-blue-400/80 mt-1">
                Sistem notifikasi sedang dalam tahap pengembangan. Pengaturan ini akan aktif pada versi mendatang.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-white/[0.04] border-white/10">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-white">Pengaturan Notifikasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {settings.map((setting) => {
            const Icon = setting.icon
            return (
              <div
                key={setting.id}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  setting.enabled ? 'bg-amber-400/10' : 'bg-white/5'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    setting.enabled ? 'text-amber-400' : 'text-white/40'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-sm">{setting.label}</h3>
                  <p className="text-xs text-white/40">{setting.description}</p>
                </div>
                <button
                  onClick={() => toggleSetting(setting.id)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    setting.enabled ? 'bg-amber-400' : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      setting.enabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card className="bg-white/[0.04] border-white/10">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-white">Email Notifikasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">
              Email Penerima
            </label>
            <input
              type="email"
              placeholder="admin@kasirpro.com"
              className="w-full mt-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400/50"
              disabled
            />
            <p className="text-xs text-white/40 mt-2">
              Email untuk menerima laporan dan notifikasi penting
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        className="w-full bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold"
      >
        <Check className="w-4 h-4 mr-2" />
        Simpan Pengaturan
      </Button>
    </div>
  )
}
