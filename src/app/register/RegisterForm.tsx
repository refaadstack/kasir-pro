'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

export default function RegisterForm() {
  const { toast } = useToast()
  const [form, setForm] = useState({ name: '', email: '', pin: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mendaftar')
      setDone(true)
    } catch (error) {
      toast({
        title: 'Pendaftaran gagal',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (done) {
    return (
      <Card>
        <CardContent className="text-center space-y-3">
          <div className="text-4xl">📧</div>
          <h2 className="text-lg font-bold text-white">Cek Email Kamu</h2>
          <p className="text-sm text-white/50">
            Kami mengirim link verifikasi ke <span className="text-amber-400">{form.email}</span>. Link
            berlaku 60 menit.
          </p>
          <Link href="/login" className="inline-block text-sm text-amber-400 hover:underline">
            Kembali ke Login
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Nama Toko / Anda</p>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Toko Berkah Jaya"
              className="bg-white/5 border-white/10 text-white h-12"
              required
            />
          </div>
          <div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Email</p>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="nama@email.com"
              className="bg-white/5 border-white/10 text-white h-12"
              required
            />
          </div>
          <div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">PIN (4 digit)</p>
            <Input
              type="text"
              inputMode="numeric"
              value={form.pin}
              onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
              placeholder="1234"
              className="bg-white/5 border-white/10 text-white h-12 text-center text-2xl tracking-widest"
              maxLength={4}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold transition-all disabled:opacity-50"
            disabled={isLoading || form.pin.length !== 4}
          >
            {isLoading ? 'Memproses...' : 'Daftar Gratis 14 Hari'}
          </button>
          <p className="text-center text-xs text-white/40">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-amber-400 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
