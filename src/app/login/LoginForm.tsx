'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

export default function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({ title: 'Error', description: 'Email dan password wajib diisi', variant: 'destructive' })
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Login Gagal', description: data.error || 'Email atau password salah', variant: 'destructive' })
        return
      }
      toast({ title: 'Login Berhasil', description: `Selamat datang, ${data.name}!` })
      router.push(data.redirectTo)
      router.refresh()
    } catch {
      toast({ title: 'Error', description: 'Terjadi kesalahan. Coba lagi.', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Email</p>
            <Input
              type="email"
              placeholder="nama@kasirpro.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
            />
          </div>
          <div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Password</p>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
            />
          </div>
          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-amber"
            disabled={isLoading || !email || !password}
          >
            {isLoading ? 'Memproses...' : 'Login'}
          </button>
        </form>
      </CardContent>
    </Card>
  )
}
