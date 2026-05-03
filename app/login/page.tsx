'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
 const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      router.push('/dashboard/kasir') // Default to kasir, middleware handles role
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent mb-2">
            KasirPro
          </h1>
          <p className="text-white/80">Masuk ke sistem POS</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
              placeholder="owner@kasirpro.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
              placeholder="••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/20 text-center">
          <p className="text-white/60 text-sm">
            Demo: owner@kasirpro.com / 1234 (Superadmin/Manager/Kasir)
          </p>
        </div>
      </div>
    </div>
  )
}

