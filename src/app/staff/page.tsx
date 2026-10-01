'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function StaffEntryPage() {
  const router = useRouter()
  const [slug, setSlug] = useState('')

  const go = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = slug.trim().toLowerCase()
    if (clean) router.push(`/staff/${clean}` as any)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.08) 0%, transparent 55%), #0f0f14',
      }}
    >
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-7">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 flex items-center justify-center mx-auto mb-4 glow-amber">
            <span className="text-gray-900 text-3xl font-black">⬡</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            Login <span className="text-amber-400">Karyawan</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">Masukkan kode toko dari owner</p>
        </div>
        <Card>
          <CardContent>
            <form onSubmit={go} className="space-y-4">
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Kode Toko</p>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="kasirpro-demo"
                  className="bg-white/5 border-white/10 text-white h-12"
                />
              </div>
              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold transition-all disabled:opacity-50"
                disabled={!slug}
              >
                Lanjut
              </button>
              <p className="text-center text-xs text-white/40">
                Owner?{' '}
                <Link href="/login" className="text-amber-400 hover:underline">
                  Login di sini
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
