'use client'

import { useState, useEffect } from 'react'
import { Save, Store, Printer, Image, Receipt } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/hooks/use-toast'

type Settings = {
  store_name: string
  store_address: string
  store_phone: string
  logo_url: string
  tax_percent: number
  receipt_prefix: string
  receipt_footer: string
  paper_width: string
}

export default function PengaturanPage() {
  const [settings, setSettings] = useState<Settings>({
    store_name: '',
    store_address: '',
    store_phone: '',
    logo_url: '',
    tax_percent: 0,
    receipt_prefix: 'TRX',
    receipt_footer: 'Terima kasih!',
    paper_width: '58mm',
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
        setSettings({
          store_name: data.store_name || '',
          store_address: data.store_address || '',
          store_phone: data.store_phone || '',
          logo_url: data.logo_url || '',
          tax_percent: data.tax_percent || 0,
          receipt_prefix: data.receipt_prefix || 'TRX',
          receipt_footer: data.receipt_footer || 'Terima kasih!',
          paper_width: data.paper_width || '58mm',
        })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (res.ok) {
        toast({ title: 'Berhasil', description: 'Pengaturan berhasil disimpan' })
      } else {
        const error = await res.json()
        toast({ title: 'Gagal', description: error.error || 'Gagal menyimpan', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Pengaturan</h1>
          <p className="text-sm text-white/40 mt-1">Konfigurasi toko dan struk</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>

      {/* Info Toko */}
      <Card className="bg-white/[0.04] border-white/10">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <Store className="w-4 h-4 text-amber-400" /> Informasi Toko
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">Nama Toko</label>
            <Input
              value={settings.store_name}
              onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
              placeholder="KasirPro"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">Alamat</label>
            <Input
              value={settings.store_address}
              onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
              placeholder="Jl. Contoh No. 123, Kota"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">No. Telepon</label>
            <Input
              value={settings.store_phone}
              onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })}
              placeholder="08123456789"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">Pajak (%)</label>
            <Input
              type="number"
              value={settings.tax_percent}
              onChange={(e) => setSettings({ ...settings, tax_percent: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              className="bg-white/5 border-white/10 text-white"
              min="0"
              max="100"
            />
          </div>
        </CardContent>
      </Card>

      {/* Logo */}
      <Card className="bg-white/[0.04] border-white/10">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <Image className="w-4 h-4 text-blue-400" /> Logo Toko
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">URL Logo</label>
            <Input
              value={settings.logo_url}
              onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="bg-white/5 border-white/10 text-white"
            />
            <p className="text-[11px] text-white/40 mt-1">Masukkan URL gambar logo (PNG/JPG). Gunakan hosting gambar seperti Imgur atau Supabase Storage.</p>
          </div>
          {settings.logo_url && (
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-xs text-white/60 mb-2">Preview:</p>
              <img
                src={settings.logo_url}
                alt="Logo"
                className="h-16 object-contain rounded"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Struk & Printer */}
      <Card className="bg-white/[0.04] border-white/10">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <Printer className="w-4 h-4 text-green-400" /> Pengaturan Struk & Printer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">Prefix Kode Transaksi</label>
            <Input
              value={settings.receipt_prefix}
              onChange={(e) => setSettings({ ...settings, receipt_prefix: e.target.value })}
              placeholder="TRX"
              className="bg-white/5 border-white/10 text-white"
            />
            <p className="text-[11px] text-white/40 mt-1">Contoh: TRX-1716012345-ABC</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">Footer Struk</label>
            <Input
              value={settings.receipt_footer}
              onChange={(e) => setSettings({ ...settings, receipt_footer: e.target.value })}
              placeholder="Terima kasih atas kunjungan Anda!"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">Ukuran Kertas Printer</label>
            <div className="flex gap-3">
              {['58mm', '80mm'].map((size) => (
                <button
                  key={size}
                  onClick={() => setSettings({ ...settings, paper_width: size })}
                  className={`flex-1 p-3 rounded-xl border text-center transition-all ${
                    settings.paper_width === size
                      ? 'bg-green-400/10 border-green-400/30 text-green-400'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <div className="text-lg font-bold">{size}</div>
                  <div className="text-[10px] mt-1">{size === '58mm' ? 'Printer kecil' : 'Printer standar'}</div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Struk */}
      <Card className="bg-white/[0.04] border-white/10">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-purple-400" /> Preview Struk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white text-black p-4 rounded-lg mx-auto font-mono text-xs" style={{ maxWidth: settings.paper_width || '58mm' }}>
            {settings.logo_url && (
              <div className="text-center mb-2">
                <img src={settings.logo_url} alt="Logo" className="h-8 mx-auto object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
            )}
            <div className="text-center">
              <div className="font-bold" style={{ fontSize: '14px' }}>{settings.store_name || 'Nama Toko'}</div>
              {settings.store_address && <div>{settings.store_address}</div>}
              {settings.store_phone && <div>Telp: {settings.store_phone}</div>}
            </div>
            <div className="border-t border-dashed border-black my-2" />
            <div className="flex justify-between"><span>No:</span><span>{settings.receipt_prefix}-XXXXX</span></div>
            <div className="flex justify-between"><span>Tgl:</span><span>18/05/2026 14:30</span></div>
            <div className="border-t border-dashed border-black my-2" />
            <div>Nasi Goreng</div>
            <div className="flex justify-between pl-2"><span>1 x 15.000</span><span>15.000</span></div>
            <div>Es Teh Manis</div>
            <div className="flex justify-between pl-2"><span>2 x 5.000</span><span>10.000</span></div>
            <div className="border-t border-dashed border-black my-2" />
            <div className="flex justify-between font-bold" style={{ fontSize: '13px' }}><span>TOTAL</span><span>Rp 25.000</span></div>
            {settings.tax_percent > 0 && (
              <div className="flex justify-between text-gray-600"><span>Pajak ({settings.tax_percent}%)</span><span>Rp {Math.round(25000 * settings.tax_percent / 100).toLocaleString('id-ID')}</span></div>
            )}
            <div className="flex justify-between"><span>TUNAI</span><span>Rp 50.000</span></div>
            <div className="flex justify-between"><span>Kembali</span><span>Rp 25.000</span></div>
            <div className="border-t border-dashed border-black my-2" />
            <div className="text-center text-[10px]">
              {settings.receipt_footer || 'Terima kasih!'}
              <br />
              <span style={{ fontSize: '9px' }}>Powered by KasirPro</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
