'use client'

import { useState, useEffect } from 'react'
import { Save, Store } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/hooks/use-toast'

type Settings = {
  store_name: string
  store_address: string
  store_phone: string
  receipt_footer: string
}

export default function PengaturanPage() {
  const [settings, setSettings] = useState<Settings>({
    store_name: 'KasirPro',
    store_address: '',
    store_phone: '',
    receipt_footer: 'Terima kasih!',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        if (data) {
          setSettings(data)
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (res.ok) {
        toast({
          title: 'Berhasil',
          description: 'Pengaturan berhasil disimpan',
        })
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan pengaturan',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <Card className="bg-white/[0.04] border-white/10">
          <CardContent className="p-8">
            <LoadingSpinner size="lg" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white">Pengaturan Toko</h1>
        <p className="text-sm text-white/40 mt-1">
          Kelola informasi toko Anda
        </p>
      </div>

      {/* Store Info */}
      <Card className="bg-white/[0.04] border-white/10">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <Store className="w-4 h-4" />
            Informasi Toko
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              Nama Toko
            </label>
            <Input
              type="text"
              value={settings.store_name}
              onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
              placeholder="Nama toko Anda"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              Alamat
            </label>
            <Input
              type="text"
              value={settings.store_address}
              onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
              placeholder="Alamat lengkap toko"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              Nomor Telepon
            </label>
            <Input
              type="text"
              value={settings.store_phone}
              onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })}
              placeholder="08xx xxxx xxxx"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              Footer Struk
            </label>
            <Input
              type="text"
              value={settings.receipt_footer}
              onChange={(e) => setSettings({ ...settings, receipt_footer: e.target.value })}
              placeholder="Pesan di bagian bawah struk"
              className="bg-white/5 border-white/10 text-white"
            />
            <p className="text-xs text-white/40 mt-1">
              Pesan ini akan muncul di bagian bawah struk pembayaran
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold"
      >
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
      </Button>
    </div>
  )
}
