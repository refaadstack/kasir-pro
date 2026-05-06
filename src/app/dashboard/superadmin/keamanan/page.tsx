'use client'

import { useState } from 'react'
import { Shield, Lock, Key, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'

export default function KeamananPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [showCurrentPin, setShowCurrentPin] = useState(false)
  const [showNewPin, setShowNewPin] = useState(false)
  const [showConfirmPin, setShowConfirmPin] = useState(false)

  const [pinForm, setPinForm] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: '',
  })

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    // Only allow 4 digits
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setPinForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmitPin = (e: React.FormEvent) => {
    e.preventDefault()

    if (pinForm.newPin.length !== 4) {
      toast({
        title: 'Error',
        description: 'PIN harus 4 digit',
        variant: 'destructive',
      })
      return
    }

    if (pinForm.newPin !== pinForm.confirmPin) {
      toast({
        title: 'Error',
        description: 'PIN baru tidak cocok',
        variant: 'destructive',
      })
      return
    }

    // In a real app, this would call an API to update the PIN
    toast({
      title: 'Berhasil',
      description: 'PIN berhasil diubah',
    })

    setPinForm({
      currentPin: '',
      newPin: '',
      confirmPin: '',
    })
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white">Keamanan</h1>
        <p className="text-sm text-white/40 mt-1">
          Kelola password dan PIN akun Anda
        </p>
      </div>

      {/* Security Info */}
      <Card className="bg-gradient-to-br from-amber-400/10 to-orange-500/10 border-amber-400/20">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-amber-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-400 text-sm">Akun Anda Aman</h3>
              <p className="text-xs text-amber-400/80 mt-1">
                Terakhir login: {new Date().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="bg-white/[0.04] border-white/10">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-white">Informasi Akun</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">
              Nama
            </label>
            <div className="mt-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
              {user?.name}
            </div>
          </div>
          <div>
            <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">
              Email
            </label>
            <div className="mt-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
              {user?.email}
            </div>
          </div>
          <div>
            <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">
              Role
            </label>
            <div className="mt-2">
              <span className="inline-block px-3 py-1.5 bg-amber-400/20 border border-amber-400/30 rounded-lg text-xs font-semibold text-amber-400">
                {user?.role}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change PIN */}
      <Card className="bg-white/[0.04] border-white/10">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-white">Ubah PIN</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitPin} className="space-y-4">
            {/* Current PIN */}
            <div>
              <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">
                PIN Saat Ini
              </label>
              <div className="relative mt-2">
                <Input
                  type={showCurrentPin ? 'text' : 'password'}
                  name="currentPin"
                  value={pinForm.currentPin}
                  onChange={handlePinChange}
                  placeholder="••••"
                  maxLength={4}
                  className="pr-10 bg-white/5 border-white/10 text-white text-center text-2xl tracking-widest font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPin(!showCurrentPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  {showCurrentPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New PIN */}
            <div>
              <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">
                PIN Baru
              </label>
              <div className="relative mt-2">
                <Input
                  type={showNewPin ? 'text' : 'password'}
                  name="newPin"
                  value={pinForm.newPin}
                  onChange={handlePinChange}
                  placeholder="••••"
                  maxLength={4}
                  className="pr-10 bg-white/5 border-white/10 text-white text-center text-2xl tracking-widest font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPin(!showNewPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm PIN */}
            <div>
              <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">
                Konfirmasi PIN Baru
              </label>
              <div className="relative mt-2">
                <Input
                  type={showConfirmPin ? 'text' : 'password'}
                  name="confirmPin"
                  value={pinForm.confirmPin}
                  onChange={handlePinChange}
                  placeholder="••••"
                  maxLength={4}
                  className="pr-10 bg-white/5 border-white/10 text-white text-center text-2xl tracking-widest font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPin(!showConfirmPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Warning */}
            <div className="flex gap-2 p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-400/90">
                Pastikan Anda mengingat PIN baru. PIN digunakan untuk login dan verifikasi transaksi penting.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold"
            >
              <Key className="w-4 h-4 mr-2" />
              Ubah PIN
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Section (Placeholder) */}
      <Card className="bg-white/[0.04] border-white/10">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-white">Ubah Password</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 p-4 bg-blue-400/10 border border-blue-400/20 rounded-xl">
            <Lock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-400 text-sm">Fitur Dalam Pengembangan</h3>
              <p className="text-xs text-blue-400/80 mt-1">
                Fitur ubah password akan tersedia pada versi mendatang. Saat ini sistem menggunakan PIN untuk autentikasi.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className="bg-white/[0.04] border-white/10">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-white">Tips Keamanan</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-xs text-white/60">
            <li className="flex gap-2">
              <span className="text-amber-400">•</span>
              <span>Jangan bagikan PIN Anda kepada siapapun</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-400">•</span>
              <span>Gunakan PIN yang tidak mudah ditebak</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-400">•</span>
              <span>Ubah PIN secara berkala untuk keamanan maksimal</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-400">•</span>
              <span>Logout setelah selesai menggunakan sistem</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
