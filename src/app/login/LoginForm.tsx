'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export default function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [shake, setShake] = useState(false)

  const handlePinClick = (digit: string) => {
    if (pin.length < 4) {
      setPin(pin + digit)
    }
  }

  const handleBackspace = () => {
    setPin(pin.slice(0, -1))
  }

  const handleClear = () => {
    setPin('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || pin.length !== 4) {
      toast({
        title: 'Error',
        description: 'Email dan PIN 4 digit harus diisi',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin }),
      })

      const data = await res.json()

      if (!res.ok) {
        // Animasi shake
        setShake(true)
        setTimeout(() => setShake(false), 500)

        toast({
          title: 'Login Gagal',
          description: data.error || 'Email atau PIN salah',
          variant: 'destructive',
        })
        setPin('')
        return
      }

      toast({
        title: 'Login Berhasil',
        description: `Selamat datang, ${data.name}!`,
      })

      // Redirect berdasarkan role
      router.push(data.redirectTo)
      router.refresh()
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan. Silakan coba lagi.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={shake ? 'animate-shake' : ''}>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">
              Email
            </p>
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

          <div className="h-px bg-white/10"></div>

          {/* PIN Input */}
          <div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">
              PIN (4 Digit)
            </p>
            
            {/* PIN Display */}
            <div className="flex justify-center gap-3 mb-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`pin-dot ${pin[i] ? 'filled' : ''}`}
                />
              ))}
            </div>

            {/* PIN Pad */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  className="h-14 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-400/30 transition-all text-lg font-bold text-white disabled:opacity-50"
                  onClick={() => handlePinClick(num.toString())}
                  disabled={isLoading || pin.length >= 4}
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                className="h-14 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm text-white/30 disabled:opacity-50"
                onClick={handleClear}
                disabled={isLoading || pin.length === 0}
              >
                CLR
              </button>
              <button
                type="button"
                className="h-14 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-400/30 transition-all text-lg font-bold text-white disabled:opacity-50"
                onClick={() => handlePinClick('0')}
                disabled={isLoading || pin.length >= 4}
              >
                0
              </button>
              <button
                type="button"
                className="h-14 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-amber-400 disabled:opacity-50"
                onClick={handleBackspace}
                disabled={isLoading || pin.length === 0}
              >
                ⌫
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-amber"
            disabled={isLoading || !email || pin.length !== 4}
          >
            {isLoading ? 'Memproses...' : 'Login'}
          </button>
        </form>
      </CardContent>
    </Card>
  )
}
