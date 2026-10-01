'use client'

import { useState } from 'react'
import { Shield, Key, Link2, Copy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'

export default function KeamananPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const [pinForm, setPinForm] = useState({ current: '', next: '', confirm: '' })
  const [isSavingPin, setIsSavingPin] = useState(false)

  const digits = (v: string) => v.replace(/\D/g, '').slice(0, 4)

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.next.length < 8) {
      toast({ title: 'Error', description: 'Password baru minimal 8 karakter', variant: 'destructive' })
      return
    }
    if (passwordForm.next !== passwordForm.confirm) {
      toast({ title: 'Error', description: 'Konfirmasi password tidak cocok', variant: 'destructive' })
      return
    }
    setIsSavingPassword(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwordForm.current, newPassword: passwordForm.next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah password')
      toast({ title: 'Berhasil', description: 'Password berhasil diubah' })
      setPasswordForm({ current: '', next: '', confirm: '' })
    } catch (error) {
      toast({ title: 'Gagal', description: error instanceof Error ? error.message : 'Error', variant: 'destructive' })
    } finally {
      setIsSavingPassword(false)
    }
  }

  const submitPin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pinForm.next.length !== 4) {
      toast({ title: 'Error', description: 'PIN harus 4 digit', variant: 'destructive' })
      return
    }
    if (pinForm.next !== pinForm.confirm) {
      toast({ title: 'Error', description: 'PIN baru tidak cocok', variant: 'destructive' })
      return
    }
    setIsSavingPin(true)
    try {
      const res = await fetch('/api/auth/change-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPin: pinForm.current || undefined, newPin: pinForm.next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah PIN')
      toast({ title: 'Berhasil', description: 'PIN berhasil diubah' })
      setPinForm({ current: '', next: '', confirm: '' })
    } catch (error) {
      toast({ title: 'Gagal', description: error instanceof Error ? error.message : 'Error', variant: 'destructive' })
    } finally {
      setIsSavingPin(false)
    }
  }

  const staffUrl = user?.tenant?.slug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/staff/${user.tenant.slug}`
    : ''

  const copyStaffUrl = async () => {
    try {
      await navigator.clipboard.writeText(staffUrl)
      toast({ title: 'Disalin', description: 'Link login karyawan disalin' })
    } catch {
      toast({ title: 'Gagal', description: 'Tidak bisa menyalin', variant: 'destructive' })
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-black text-white">Keamanan</h1>
        <p className="text-sm text-white/40 mt-1">Kelola password, PIN, dan akses karyawan</p>
      </div>

      <Card className="bg-gradient-to-br from-amber-400/10 to-orange-500/10 border-amber-400/20">
        <CardContent className="p-4 flex gap-3">
          <div className="w-10 h-10 bg-amber-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-400 text-sm">Akun Anda</h3>
            <p className="text-xs text-amber-400/80 mt-1">
              {user?.name} · {user?.username ? `@${user.username}` : user?.email}
            </p>
          </div>
        </CardContent>
      </Card>

      {staffUrl && (
        <Card className="bg-white/[0.04] border-white/10">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Link2 className="w-4 h-4" /> Link Login Karyawan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs break-all">
              {staffUrl}
            </div>
            <Button variant="outline" size="sm" onClick={copyStaffUrl}>
              <Copy className="w-3.5 h-3.5 mr-1.5" /> Salin link
            </Button>
            <p className="text-[11px] text-white/40">
              Bagikan ke karyawan. Mereka login pakai username + PIN.
            </p>
          </CardContent>
        </Card>
      )}

      {user?.role === 'SUPERADMIN' && (
        <Card className="bg-white/[0.04] border-white/10">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white">Ubah Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitPassword} className="space-y-3">
              <Input
                type="password"
                placeholder="Password lama"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
              <Input
                type="password"
                placeholder="Password baru (min. 8 karakter)"
                value={passwordForm.next}
                onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
              <Input
                type="password"
                placeholder="Ulangi password baru"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
              <Button
                type="submit"
                className="w-full bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold"
                disabled={isSavingPassword}
              >
                {isSavingPassword ? 'Menyimpan...' : 'Simpan Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white/[0.04] border-white/10">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4" /> Ubah PIN
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitPin} className="space-y-3">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="PIN lama"
              value={pinForm.current}
              onChange={(e) => setPinForm({ ...pinForm, current: digits(e.target.value) })}
              className="bg-white/5 border-white/10 text-white text-center tracking-widest"
            />
            <Input
              type="text"
              inputMode="numeric"
              placeholder="PIN baru (4 digit)"
              value={pinForm.next}
              onChange={(e) => setPinForm({ ...pinForm, next: digits(e.target.value) })}
              className="bg-white/5 border-white/10 text-white text-center tracking-widest"
            />
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Ulangi PIN baru"
              value={pinForm.confirm}
              onChange={(e) => setPinForm({ ...pinForm, confirm: digits(e.target.value) })}
              className="bg-white/5 border-white/10 text-white text-center tracking-widest"
            />
            <p className="text-[11px] text-white/40">PIN dipakai untuk approve void.</p>
            <Button
              type="submit"
              className="w-full bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold"
              disabled={isSavingPin}
            >
              {isSavingPin ? 'Menyimpan...' : 'Simpan PIN'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
